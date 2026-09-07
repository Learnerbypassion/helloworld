/**
 * Voice & Indic Language Service (Sarvam AI & Bhashini Proxy)
 *
 * Provides Indian mother-tongue speech synthesis (TTS) with authentic regional accents
 * and speech recognition (ASR) tailored for Indian healthcare kiosk users.
 *
 * Features:
 *   - Built-in Persistent Audio Cache (backend/audio_cache):
 *     Initial prompts and common commands for all languages are stored on disk.
 *     Subsequent calls for the same prompt return in <5ms with 0 network latency!
 *   - Sarvam AI Bulbul v3 TTS + Mayura translation
 *   - Bhashini ULCA fallback
 *   - Web Speech API client fallback
 */

const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const router = express.Router();

const SARVAM_URL         = "https://api.sarvam.ai";
const BHASINI_URL        = process.env.BHASINI_URL         || "https://dhruva-api.bhashini.gov.in";
const BHASINI_PIPELINE   = process.env.BHASINI_PIPELINE_ID || "64392f96daac500b55c543cd";
const TIMEOUT_MS         = parseInt(process.env.BHASINI_TIMEOUT_MS || "15000", 10);

const AUDIO_CACHE_DIR = path.resolve(__dirname, "../../audio_cache");
if (!fs.existsSync(AUDIO_CACHE_DIR)) {
  try { fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true }); } catch (_) {}
}

// Sarvam BCP-47 Language Codes
const SARVAM_LANG_CODE = {
  "English":   "en-IN",
  "Hindi":     "hi-IN",
  "Tamil":     "ta-IN",
  "Bengali":   "bn-IN",
  "Marathi":   "mr-IN",
  "Telugu":    "te-IN",
  "Kannada":   "kn-IN",
  "Gujarati":  "gu-IN",
  "Malayalam": "ml-IN",
  "Punjabi":   "pa-IN",
  "Odia":      "od-IN",
};

// Bhashini 2-letter Language Codes
const BHASINI_LANG_CODE = {
  "English":  "en",
  "Hindi":    "hi",
  "Tamil":    "ta",
  "Bengali":  "bn",
  "Marathi":  "mr",
  "Telugu":   "te",
  "Kannada":  "kn",
  "Gujarati": "gu",
};

// Voice speakers for Bulbul v3
const SARVAM_VOICE_BY_LANG = {
  "bn-IN": "suhani",
  "hi-IN": "roopa",
  "ta-IN": "gokul",
  "te-IN": "kavitha",
  "mr-IN": "ishita",
  "gu-IN": "pooja",
  "kn-IN": "kavitha",
  "ml-IN": "roopa",
  "pa-IN": "anand",
  "od-IN": "roopa",
  "en-IN": "roopa",
};

// --- Cache Helpers ---
function getCacheKey(text, lang, speaker = "") {
  return crypto.createHash("md5").update(`${lang}::${speaker}::${text.trim()}`).digest("hex");
}

function getCachedAudio(text, lang, speaker = "") {
  try {
    const filePath = path.join(AUDIO_CACHE_DIR, `${getCacheKey(text, lang, speaker)}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (_) {}
  return null;
}

function setCachedAudio(text, lang, speaker = "", data) {
  try {
    const filePath = path.join(AUDIO_CACHE_DIR, `${getCacheKey(text, lang, speaker)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), "utf8");
  } catch (_) {}
}

function getSarvamKey() {
  try {
    const envPath = path.resolve(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^SARVAM_API_KEY[ \t]*=[ \t]*([^\r\n#]+)/m);
      if (match && match[1] && match[1].trim()) {
        const clean = match[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.SARVAM_API_KEY = clean;
        return clean;
      } else {
        delete process.env.SARVAM_API_KEY;
      }
    }
  } catch (_) {}
  return (process.env.SARVAM_API_KEY || process.env.SARVAM_KEY || "").trim();
}

function getBhasiniKey() {
  try {
    const envPath = path.resolve(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^BHASINI_API_KEY[ \t]*=[ \t]*([^\r\n#]+)/m);
      if (match && match[1] && match[1].trim()) {
        const clean = match[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.BHASINI_API_KEY = clean;
        return clean;
      } else {
        delete process.env.BHASINI_API_KEY;
      }
    }
  } catch (_) {}
  return (process.env.BHASINI_API_KEY || "").trim();
}

function getActiveProvider() {
  const sKey = getSarvamKey();
  if (sKey) return "sarvam";
  const bKey = getBhasiniKey();
  if (bKey) return "bhashini";
  return "none";
}

// GET /api/bhasini/status
router.get("/status", (req, res) => {
  const provider = getActiveProvider();
  res.json({
    available: provider !== "none",
    provider: provider,
    label: provider === "sarvam"
      ? "Sarvam AI Indic Mother-Tongue Engine"
      : provider === "bhashini"
      ? "Bhashini ULCA Pipeline"
      : "Browser Web Speech",
    cache_enabled: true,
  });
});

// POST /api/bhasini/tts
// Body: { text: string, language: string, speaker?: string }
router.post("/tts", async (req, res) => {
  const { text, language = "Hindi", speaker } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const targetLang = SARVAM_LANG_CODE[language] || "hi-IN";
  const activeSpeaker = speaker || SARVAM_VOICE_BY_LANG[targetLang] || "roopa";

  // 1. Check local audio cache first (Instant <5ms return!)
  const cached = getCachedAudio(text, language, activeSpeaker);
  if (cached && cached.audioContent) {
    return res.json({
      ...cached,
      cached: true,
      provider: cached.provider || "sarvam-cache",
    });
  }

  const sarvamKey = getSarvamKey();
  const bhasiniKey = getBhasiniKey();

  if (!sarvamKey && !bhasiniKey) {
    return res.status(503).json({
      error: "Voice engine not configured. Please add SARVAM_API_KEY to backend/.env",
      fallback: true
    });
  }

  // -------------------------------------------------------------
  // 2. SARVAM AI (Bulbul v3 TTS + Mayura translation)
  // -------------------------------------------------------------
  if (sarvamKey) {
    try {
      let textToSpeak = text;

      // If prompt is in English and patient chose an Indian regional language,
      // translate it with Sarvam Mayura into their mother tongue!
      const hasEnglish = /[a-zA-Z]{3,}/.test(text);
      if (hasEnglish && targetLang !== "en-IN") {
        try {
          const transResp = await axios.post(
            `${SARVAM_URL}/translate`,
            {
              input: text,
              source_language_code: "en-IN",
              target_language_code: targetLang,
              speaker_gender: "Female",
              mode: "formal",
              model: "mayura:v1",
            },
            {
              headers: {
                "Content-Type": "application/json",
                "api-subscription-key": sarvamKey,
              },
              timeout: 8000,
            }
          );
          if (transResp.data?.translated_text) {
            textToSpeak = transResp.data.translated_text;
            console.log(`[Sarvam] Translated prompt to ${targetLang}: "${textToSpeak}"`);
          }
        } catch (transErr) {
          console.warn("[Sarvam] Translation fallback to original text:", transErr.message?.slice(0, 80));
        }
      }

      // Generate speech via Sarvam Bulbul v3 TTS
      const ttsResp = await axios.post(
        `${SARVAM_URL}/text-to-speech`,
        {
          inputs: [textToSpeak],
          target_language_code: targetLang,
          speaker: activeSpeaker,
          pitch: 0,
          pace: 0.95,
          loudness: 1.5,
          speech_sample_rate: 22050,
          enable_preprocessing: true,
          model: "bulbul:v3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": sarvamKey,
          },
          timeout: TIMEOUT_MS,
        }
      );

      const audio = ttsResp.data?.audios?.[0] || null;
      if (!audio) throw new Error("No audio returned in Sarvam response");

      const responsePayload = {
        audioContent: audio,
        encoding: "base64/wav",
        provider: "sarvam",
        language: targetLang,
        speaker: activeSpeaker,
        translated_text: textToSpeak !== text ? textToSpeak : null,
      };

      // Store in persistent cache so next time it is instantaneous!
      setCachedAudio(text, language, activeSpeaker, responsePayload);

      return res.json(responsePayload);
    } catch (err) {
      console.warn("[Sarvam] TTS error:", err.response?.data || err.message?.slice(0, 100));
      if (!bhasiniKey) {
        return res.status(503).json({
          error: "Sarvam AI TTS error",
          fallback: true,
          detail: err.message?.slice(0, 80)
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. BHASHINI ULCA PIPELINE FALLBACK
  // -------------------------------------------------------------
  if (bhasiniKey) {
    try {
      const srcLang = BHASINI_LANG_CODE[language] || "hi";
      const payload = {
        pipelineTasks: [
          {
            taskType: "tts",
            config: {
              language:     { sourceLanguage: srcLang },
              serviceId:    "",
              gender:       "female",
              samplingRate: 8000,
            },
          },
        ],
        inputData: { input: [{ source: text }] },
      };

      const resp = await axios.post(
        `${BHASINI_URL}/services/inference/pipeline`,
        payload,
        {
          headers: {
            "Content-Type":  "application/json",
            "Authorization": bhasiniKey,
            "userID":        bhasiniKey,
          },
          timeout: TIMEOUT_MS,
          params: { pipelineId: BHASINI_PIPELINE },
        }
      );

      const audio = resp.data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent || null;
      if (!audio) return res.status(502).json({ error: "No audio returned from Bhasini", fallback: true });

      const responsePayload = { audioContent: audio, encoding: "base64/wav", provider: "bhashini" };
      setCachedAudio(text, language, activeSpeaker, responsePayload);
      return res.json(responsePayload);
    } catch (err) {
      console.info("[Bhasini] TTS error:", err.message?.slice(0, 80));
      return res.status(503).json({
        error: "Bhasini TTS unavailable",
        fallback: true,
        detail: err.message?.slice(0, 80)
      });
    }
  }
});

// POST /api/bhasini/asr
// Body: { audioBase64: string, language: string }
router.post("/asr", async (req, res) => {
  const sarvamKey = getSarvamKey();
  const bhasiniKey = getBhasiniKey();

  if (!sarvamKey && !bhasiniKey) {
    return res.status(503).json({ error: "Voice engine not configured", fallback: true });
  }

  const { audioBase64, language = "Hindi" } = req.body;
  if (!audioBase64) return res.status(400).json({ error: "audioBase64 is required" });

  // 1. Sarvam Saarika ASR
  if (sarvamKey) {
    try {
      const targetLang = SARVAM_LANG_CODE[language] || "unknown";
      const audioBuffer = Buffer.from(audioBase64, "base64");
      const FormData = require("form-data");
      const form = new FormData();
      form.append("file", audioBuffer, { filename: "speech.wav", contentType: "audio/wav" });
      form.append("model", "saarika:v1");
      if (targetLang !== "unknown") {
        form.append("language_code", targetLang);
      }

      const resp = await axios.post(`${SARVAM_URL}/speech-to-text`, form, {
        headers: {
          ...form.getHeaders(),
          "api-subscription-key": sarvamKey,
        },
        timeout: 15000,
      });

      const transcript = resp.data?.transcript || "";
      return res.json({ transcript, provider: "sarvam" });
    } catch (err) {
      console.warn("[Sarvam] ASR error:", err.response?.data || err.message?.slice(0, 100));
      if (!bhasiniKey) {
        return res.status(503).json({
          error: "Sarvam ASR unavailable",
          fallback: true,
          detail: err.message?.slice(0, 80)
        });
      }
    }
  }

  // 2. Bhashini ASR
  if (bhasiniKey) {
    try {
      const srcLang = BHASINI_LANG_CODE[language] || "hi";
      const payload = {
        pipelineTasks: [
          {
            taskType: "asr",
            config: {
              language:     { sourceLanguage: srcLang },
              serviceId:    "",
              samplingRate: 16000,
            },
          },
        ],
        inputData: { audio: [{ audioContent: audioBase64 }] },
      };

      const resp = await axios.post(
        `${BHASINI_URL}/services/inference/pipeline`,
        payload,
        {
          headers: {
            "Content-Type":  "application/json",
            "Authorization": bhasiniKey,
            "userID":        bhasiniKey,
          },
          timeout: TIMEOUT_MS,
          params: { pipelineId: BHASINI_PIPELINE },
        }
      );

      const transcript = resp.data?.pipelineResponse?.[0]?.output?.[0]?.source || "";
      return res.json({ transcript, provider: "bhashini" });
    } catch (err) {
      console.info("[Bhasini] ASR error:", err.message?.slice(0, 80));
      return res.status(503).json({
        error: "Bhasini ASR unavailable",
        fallback: true,
        detail: err.message?.slice(0, 80)
      });
    }
  }
});

// POST /api/bhasini/translate
// Body: { text: string, targetLanguage: string, sourceLanguage?: string }
router.post("/translate", async (req, res) => {
  const sarvamKey = getSarvamKey();
  if (!sarvamKey) {
    return res.status(503).json({ error: "Sarvam AI not configured", fallback: true });
  }

  const { text, targetLanguage = "Hindi", sourceLanguage = "English" } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  try {
    const srcLang = SARVAM_LANG_CODE[sourceLanguage] || "en-IN";
    const tgtLang = SARVAM_LANG_CODE[targetLanguage] || "hi-IN";

    const resp = await axios.post(
      `${SARVAM_URL}/translate`,
      {
        input: text,
        source_language_code: srcLang,
        target_language_code: tgtLang,
        speaker_gender: "Female",
        mode: "formal",
        model: "mayura:v1",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": sarvamKey,
        },
        timeout: 8000,
      }
    );

    return res.json({
      translated_text: resp.data?.translated_text || text,
      source_language: srcLang,
      target_language: tgtLang,
    });
  } catch (err) {
    return res.status(500).json({ error: "Translation error", detail: err.message?.slice(0, 80) });
  }
});

module.exports = router;
