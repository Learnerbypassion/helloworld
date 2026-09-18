/**
 * mobileUpload.js — QR-code phone handoff routes.
 *
 * Kiosk-side routes (requireAuth):
 *   POST /api/sessions/:id/upload-token   — issue session-scoped upload token
 *
 * Unauthenticated QR route:
 *   GET  /api/mobile-upload-qr/:token     — return QR data URL for the mobile page
 *
 * Unauthenticated phone-side routes (token is the only credential):
 *   GET  /api/mobile-upload/:token         — validate token, return { valid, reason }
 *   POST /api/mobile-upload/:token/document — upload file, run OCR, return result
 *
 * Security model:
 *   - Tokens are UUID-v4 strings, tied to exactly one IntakeSession.
 *   - Expiry: UPLOAD_TOKEN_TTL_MS (10 min). Named constant, not a magic number.
 *   - Proactive invalidation: issuing a new token on any session for the same
 *     kiosk_id immediately expires prior live tokens on that kiosk, preventing
 *     wrong-patient document attribution in the abandoned-session case.
 *   - No patient data is returned through the unauthenticated phone routes.
 */
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const { IntakeSession } = require("../db");
const { requireAuth }   = require("../auth");
const { handleDocumentUpload } = require("../documentUpload");

const os = require("os");

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PORT          = process.env.PORT          || 8000; // backend API port
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173; // Vite dev / static-serve port

/**
 * Dynamically resolves the machine's active LAN IPv4 address so phones on WiFi
 * can always connect without requiring manual .env editing on network changes.
 */
function getLanHost() {
  const envHost = (process.env.KIOSK_LAN_HOST || "").trim();
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  // Filter out host-only / virtual adapters (e.g. VirtualBox, WSL, vEthernet)
  const physical = candidates.find(
    c => !/virtual|vethernet|vbox|loopback|pseudo/i.test(c.name) && !c.address.startsWith("192.168.56.")
  );
  const detectedIp = physical ? physical.address : (candidates[0]?.address || "localhost");

  // If envHost is set to a valid address that is currently active on this machine, honor it
  if (envHost && envHost !== "localhost" && envHost !== "127.0.0.1") {
    const isCurrentlyActive = candidates.some(c => c.address === envHost);
    if (isCurrentlyActive) return envHost;
  }

  return detectedIp;
}

// ─── Shared token validator ────────────────────────────────────────────────────

/**
 * Looks up the session by upload_token and validates expiry.
 * Sends the appropriate error response and returns null on failure.
 * Returns the session document on success.
 *
 * Uses a plain two-line early-return form (not the comma-operator pattern)
 * to match the rest of this codebase and avoid misread copy-paste mistakes.
 */
async function validateToken(token, res) {
  let session;
  try {
    session = await IntakeSession.findOne({ upload_token: token });
  } catch (_) {
    res.status(500).json({ valid: false, reason: "server_error" });
    return null;
  }

  if (!session) {
    res.status(404).json({ valid: false, reason: "not_found" });
    return null;
  }

  if (!session.upload_token_expires_at || session.upload_token_expires_at < new Date()) {
    res.status(410).json({ valid: false, reason: "expired" });
    return null;
  }

  return session;
}

// ─── Kiosk-side: issue upload token ───────────────────────────────────────────

/**
 * POST /api/sessions/:id/upload-token
 *
 * Called by the kiosk when the patient reaches Step 5.
 * 1. Proactively expires any live token on the same kiosk_id (abandoned-session guard).
 * 2. Generates a fresh UUID token with a 10-min expiry.
 * 3. Returns { token, expires_at, kiosk_lan_host, is_localhost }.
 *
 * is_localhost: true tells the frontend to show the "not configured" warning
 * instead of requesting a QR that won't work.
 */
router.post("/sessions/:id/upload-token", requireAuth, async (req, res) => {
  try {
    const session = await IntakeSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Proactive invalidation: immediately expire any live token belonging to
    // another session on the same physical kiosk. This closes the abandoned-
    // session / wrong-patient-attribution risk without requiring single-use tokens.
    const activeKioskId = session.kiosk_id || "KIOSK-01";
    await IntakeSession.updateMany(
      {
        kiosk_id: activeKioskId,
        _id: { $ne: session._id },
        upload_token_expires_at: { $gt: new Date() },
      },
      { $set: { upload_token_expires_at: new Date() } }
    );

    // Issue new token
    const token      = uuidv4();
    const expires_at = new Date(Date.now() + UPLOAD_TOKEN_TTL_MS);

    await IntakeSession.findByIdAndUpdate(session._id, {
      kiosk_id:                activeKioskId,
      upload_token:            token,
      upload_token_expires_at: expires_at,
      upload_token_used:       false,
    });

    const lanHost = getLanHost();
    res.json({
      token,
      expires_at,
      kiosk_lan_host: lanHost,
      port:           PORT,
      frontend_port:  FRONTEND_PORT,
      is_localhost:   lanHost === "localhost" || lanHost === "127.0.0.1",
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate upload token" });
  }
});

// ─── QR code image ─────────────────────────────────────────────────────────────

/**
 * GET /api/mobile-upload-qr/:token
 *
 * Validates the token (existence + expiry), then generates and returns a QR
 * code as a PNG data URL encoding the full mobile-upload page URL.
 *
 * The QR URL includes the /dhanvantari base path because that's the Vite base
 * and the React BrowserRouter basename — the phone browser needs the full path.
 * The App.jsx route uses /mobile-upload/:token (no base prefix) per React Router
 * convention; together they resolve to the same page.
 */
router.get("/mobile-upload-qr/:token", async (req, res) => {
  try {
    const session = await IntakeSession.findOne({ upload_token: req.params.token });

    if (!session) {
      return res.status(404).json({ error: "Token not found" });
    }
    if (!session.upload_token_expires_at || session.upload_token_expires_at < new Date()) {
      return res.status(410).json({ error: "Token expired" });
    }

    const lanHost = getLanHost();
    const mobileUrl = `http://${lanHost}:${FRONTEND_PORT}/dhanvantari/mobile-upload/${req.params.token}`;

    const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: { dark: "#1e293b", light: "#ffffff" },
    });

    res.json({ qr_data_url: qrDataUrl, mobile_url: mobileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate QR code" });
  }
});

// ─── Phone-side: validate token ───────────────────────────────────────────────

/**
 * GET /api/mobile-upload/:token
 *
 * Called by MobileUpload.jsx on page load.
 * Returns { valid: true } if the token is active, or { valid: false, reason } if not.
 * Deliberately returns NO patient data — the phone page is anonymous.
 */
router.get("/mobile-upload/:token", async (req, res) => {
  const session = await validateToken(req.params.token, res);
  if (!session) return; // response already sent by validateToken
  res.json({ valid: true });
});

// ─── Phone-side: upload document ──────────────────────────────────────────────

/**
 * POST /api/mobile-upload/:token/document
 *
 * The phone-side upload endpoint. Token is the only credential.
 * Delegates to handleDocumentUpload() — the exact same shared helper that
 * the kiosk-auth route (POST /api/sessions/:id/document) uses, so the OCR
 * pipeline and Document.create() logic are not duplicated.
 */
router.post("/mobile-upload/:token/document", async (req, res) => {
  try {
    const session = await validateToken(req.params.token, res);
    if (!session) return; // response already sent

    await handleDocumentUpload(session._id.toString(), req, res);
  } catch (err) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
