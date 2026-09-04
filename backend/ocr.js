/**
 * MediKiosk — Document Digitization Pipeline (Module B), Node.js port.
 *
 * Real OCR via tesseract.js (pure-JS build of the Tesseract engine — no
 * native binary install needed, unlike the old pytesseract version). First
 * run downloads the English traineddata to a local cache; after that it
 * runs fully offline.
 */
const { createWorker } = require("tesseract.js");
const { processExtractedText } = require("./extract");

let workerPromise = null;
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }
  return workerPromise;
}

async function runOcr(imagePath) {
  const worker = await getWorker();
  const { data } = await worker.recognize(imagePath);
  return data.text || "";
}

async function processDocument(imagePath) {
  const text = await runOcr(imagePath);
  return processExtractedText(text);
}

module.exports = { runOcr, processDocument };
