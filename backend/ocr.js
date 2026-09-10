const fs       = require("fs");
const path     = require("path");
const axios    = require("axios");
const FormData = require("form-data");
const { processExtractedText } = require("./extract");

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://127.0.0.1:8001";
const OCR_TIMEOUT_MS  = parseInt(process.env.OCR_TIMEOUT_MS || "30000", 10);

async function runOcr(imagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: "application/octet-stream",
  });

  let response;
  try {
    response = await axios.post(`${OCR_SERVICE_URL}/ocr`, form, {
      headers: form.getHeaders(),
      timeout: OCR_TIMEOUT_MS,
      maxBodyLength: Infinity,
    });
  } catch (err) {
    const connError = ["ECONNREFUSED","ECONNRESET","ETIMEDOUT","ENOTFOUND"].includes(err.code);
    if (connError) {
      throw new Error(
        `OCR service is unavailable (${OCR_SERVICE_URL}). ` +
        "Start it: cd ocr-service && python main.py"
      );
    }
    const detail = err.response?.data?.detail || err.message;
    throw new Error(`OCR service error: ${detail}`);
  }

  if (!response.data.success) throw new Error("OCR service returned success=false");
  if (response.data.text) return response.data.text;
  if (Array.isArray(response.data.results)) {
    const lines = [];
    for (const item of response.data.results) {
      const recs = item?.res?.rec_texts || item?.rec_texts;
      if (Array.isArray(recs)) lines.push(...recs);
    }
    if (lines.length > 0) return lines.join("\n");
  }
  return response.data.text || "";
}

async function processDocument(imagePath) {
  const text = await runOcr(imagePath);
  console.log("This is coming from the OCR",processExtractedText(text));
  return processExtractedText(text);
}

module.exports = { runOcr, processDocument };
