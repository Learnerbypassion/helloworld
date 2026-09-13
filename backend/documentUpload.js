/**
 * documentUpload.js — shared multer + OCR + Document.create helper.
 *
 * Called by both:
 *   - POST /api/sessions/:id/document  (kiosk, requireAuth)
 *   - POST /api/mobile-upload/:token/document  (phone, token-auth)
 *
 * This avoids duplicating OCR / document-creation logic between the two
 * entry points. Only the auth layer differs; everything downstream is the same.
 */
const path   = require("path");
const fs     = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const { Document } = require("./db");
const { processDocument } = require("./ocr");

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 10 MB limit — shared cap used by both upload routes.
const multerUpload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

/**
 * Wraps multer in a promise so it can be awaited.
 * Rejects with the multer error on failure (caller inspects err.code).
 */
function multerMiddleware(req, res) {
  return new Promise((resolve, reject) => {
    multerUpload(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * handleDocumentUpload(sessionId, req, res)
 *
 * Runs the full upload pipeline and sends the JSON response.
 * Returns true on success, false if a response was already sent.
 *
 * Failure cases handled:
 *   - No file in request           → 400
 *   - File too large (>10 MB)      → 413 with friendly message
 *   - Multer error                 → 400
 *   - OCR service unavailable      → 503  (temp file cleaned up)
 *   - Unexpected error             → 500
 */
async function handleDocumentUpload(sessionId, req, res) {
  // 1. Run multer
  try {
    await multerMiddleware(req, res);
  } catch (multerErr) {
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: "File too large. Maximum allowed size is 10 MB. Please compress or crop the document.",
      });
      return false;
    }
    res.status(400).json({ error: multerErr.message || "File upload failed" });
    return false;
  }

  // 2. Validate file was received
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return false;
  }

  // 3. Move from multer temp path to a UUID-named final path
  const ext       = path.extname(req.file.originalname) || ".png";
  const fname     = `${uuidv4()}${ext}`;
  const finalPath = path.join(UPLOAD_DIR, fname);
  fs.renameSync(req.file.path, finalPath);

  // 4. Run OCR — clean up the file on failure
  let result;
  try {
    result = await processDocument(finalPath);
  } catch (err) {
    // IMPORTANT: clean up the temp file so uploads/ doesn't accumulate orphans.
    try { fs.unlinkSync(finalPath); } catch (_) {}
    res.status(503).json({ error: `OCR failed: ${err.message}` });
    return false;
  }

  // 5. Persist to DB and respond
  const doc = await Document.create({
    session_id:     sessionId,
    filename:       fname,
    raw_ocr_text:   result.raw_text,
    extracted_meds: result.medications,
    extracted_labs: result.labs,
  });

  res.json({
    document_id: doc.id,
    raw_text:    result.raw_text,
    medications: result.medications,
    labs:        result.labs,
  });
  return true;
}

module.exports = { multerMiddleware, handleDocumentUpload };
