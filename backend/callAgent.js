/**
 * MediKiosk -- Automated Queue-Calling & SMS Notification Agent
 *
 * Uses Twilio Programmable Voice (primary) with Twilio Programmable Messaging (fallback)
 * when TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER are configured.
 *
 * When Twilio is unconfigured or in demo mode:
 *   - Logs clearly to console with phone numbers masked (same format as otpService.js).
 *   - Never blocks, never throws, and allows the kiosk/doctor app to operate completely normally.
 *
 * NOTE FOR LIVE DEMOS (TWILIO TRIAL ACCOUNTS):
 *   Twilio trial accounts can ONLY call or text phone numbers that have been
 *   pre-verified in your Twilio Console (Verified Caller IDs). Live calls will
 *   connect to team members' verified numbers, while demo mode handles all other numbers.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER  = process.env.TWILIO_FROM_NUMBER;

const CALL_AGENT_ENABLED = Boolean(
  TWILIO_ACCOUNT_SID &&
  TWILIO_AUTH_TOKEN  &&
  TWILIO_FROM_NUMBER &&
  TWILIO_ACCOUNT_SID !== "your_twilio_account_sid" &&
  !TWILIO_ACCOUNT_SID.includes("your_")
);

let twilioClient = null;
if (CALL_AGENT_ENABLED) {
  try {
    twilioClient = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log("[callAgent] Twilio Programmable Voice & SMS configured -- live automated queue calling enabled");
  } catch (e) {
    console.warn("[callAgent] twilio package initialization error:", e.message, "-- falling back to demo mode");
  }
}

function printCallAgentStartupWarning() {
  if (!CALL_AGENT_ENABLED) {
    console.log("[callAgent] Running in DEMO/LOG-ONLY mode (TWILIO_FROM_NUMBER or Twilio credentials not set in .env)");
    console.log("[callAgent] Automated queue calls & SMS will simulate gracefully via console logs with masked phone numbers.");
  }
}

/**
 * Mask phone number to protect patient privacy in console logs:
 * e.g. "+919876543210" -> "********3210"
 */

/**
 * Normalizes a phone number to standard E.164 format.
 * Converts 10-digit Indian mobile numbers (e.g. "6297796553") -> "+916297796553"
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  let clean = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (/^[6-9]\d{9}$/.test(clean)) {
    return `+91${clean}`;
  }
  if (/^91[6-9]\d{9}$/.test(clean)) {
    return `+${clean}`;
  }
  if (!clean.startsWith("+")) {
    return `+${clean}`;
  }
  return clean;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "unknown";
  return phone.length > 4 ? phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4) : phone;
}

/**
 * Map Indian languages to Twilio <Say> supported language codes and voices
 */
const LANGUAGE_SAY_MAP = {
  hindi: { lang: "hi-IN", voice: "Polly.Aditi" },
  tamil: { lang: "ta-IN", voice: "Polly.Valluvar" },
  telugu: { lang: "te-IN", voice: "Polly.Chitra" },
  bengali: { lang: "bn-IN", voice: "Polly.Kalyani" },
  marathi: { lang: "mr-IN", voice: "Polly.Aditi" },
  gujarati: { lang: "gu-IN", voice: "Polly.Aditi" },
  kannada: { lang: "kn-IN", voice: "Polly.Girish" },
  malayalam: { lang: "ml-IN", voice: "Polly.Midhun" },
  english: { lang: "en-IN", voice: "Polly.Aditi" },
};

function getTwilioSayConfig(language) {
  if (!language || typeof language !== "string") return LANGUAGE_SAY_MAP.english;
  const clean = language.trim().toLowerCase();
  return LANGUAGE_SAY_MAP[clean] || LANGUAGE_SAY_MAP.english;
}

function escapeXml(unsafe) {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Outbound Voice Call via Twilio Programmable Voice
 */
async function callPatient(phone, message, { language = "English" } = {}) {
  const normalizedPhone = normalizePhone(phone);
  const masked = maskPhone(normalizedPhone);
  const sayConfig = getTwilioSayConfig(language);

  if (CALL_AGENT_ENABLED && twilioClient) {
    // Twilio Trial accounts restrict the inline 'twiml' parameter (throws "trial accounts have limited parameter access").
    // Twilio's official Twimlet URL service dynamically renders <Say> for any message text and voice on BOTH trial and full accounts.
    // Use Twilio's twimlet echo with <Hangup/> so the call cleanly terminates after speaking
    // and never attempts an invalid next action (which causes the "application error" prompt).
    const twimlXml = `<Response><Say language="${sayConfig.lang}" voice="${sayConfig.voice}">${escapeXml(message)}</Say><Hangup/></Response>`;
    const twimletUrl = process.env.TWILIO_TWIML_URL || `https://twimlets.com/echo?Twiml=${encodeURIComponent(twimlXml)}`;

    try {
      const call = await twilioClient.calls.create({
        url: twimletUrl,
        to: normalizedPhone,
        from: TWILIO_FROM_NUMBER,
      });

      console.log(`[callAgent][LIVE CALL] Call placed to ${masked} (SID: ${call.sid})`);
      return { success: true, sid: call.sid, demo: false, mode: "call" };
    } catch (err) {
      console.warn(`[callAgent] Twilio call to ${masked} failed: ${err.message} (Code: ${err.code || "N/A"})`);
      throw err;
    }
  }

  // Demo fallback
  console.log(`[callAgent][DEMO CALL] Calling ${masked} [${sayConfig.lang}]: "${message}"`);
  return { success: true, demo: true, mode: "call", message };
}

/**
 * Outbound SMS via Twilio Programmable Messaging
 */
async function textPatient(phone, message) {
  const normalizedPhone = normalizePhone(phone);
  const masked = maskPhone(normalizedPhone);

  if (CALL_AGENT_ENABLED && twilioClient) {
    try {
      const msg = await twilioClient.messages.create({
        to: normalizedPhone,
        from: TWILIO_FROM_NUMBER,
        body: message,
      });
      console.log(`[callAgent][LIVE SMS] SMS sent to ${masked} (SID: ${msg.sid})`);
      return { success: true, sid: msg.sid, demo: false, mode: "sms" };
    } catch (err) {
      console.warn(`[callAgent] Twilio SMS to ${masked} failed: ${err.message} (Code: ${err.code || "N/A"})`);
      throw err;
    }
  }

  // Demo fallback
  console.log(`[callAgent][DEMO SMS] Texting ${masked}: "${message}"`);
  return { success: true, demo: true, mode: "sms", message };
}

/**
 * Unified notification helper:
 * - mode = "call": attempts phone call first; if Twilio fails (e.g. trial unverified number), falls back to SMS.
 * - mode = "sms": sends SMS directly.
 * - Always non-blocking and safe: never throws to caller.
 */
async function notifyPatient(phone, message, { mode = "call", language = "English" } = {}) {
  const masked = maskPhone(phone);
  try {
    if (!phone) {
      console.warn("[callAgent] Cannot notify patient: phone number is missing or empty.");
      return { success: false, error: "Missing phone number" };
    }

    if (mode === "sms") {
      const res = await textPatient(phone, message);
      return { ...res, path: "sms_direct" };
    }

    // Default: Voice call with automatic SMS fallback
    try {
      const callRes = await callPatient(phone, message, { language });
      return { ...callRes, path: callRes.demo ? "demo_call" : "call_succeeded" };
    } catch (callErr) {
      console.warn(`[callAgent] Call to ${masked} encountered error: ${callErr.message}. Attempting SMS fallback...`);
      try {
        const smsRes = await textPatient(phone, message);
        return { ...smsRes, path: "call_failed_sms_fallback", callError: callErr.message };
      } catch (smsErr) {
        console.error(`[callAgent] Both call and SMS fallback failed for ${masked}: ${smsErr.message}`);
        return { success: false, path: "failed_both", error: smsErr.message };
      }
    }
  } catch (err) {
    console.error(`[callAgent] Unexpected notification error for ${masked}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  callPatient,
  textPatient,
  notifyPatient,
  printCallAgentStartupWarning,
  CALL_AGENT_ENABLED,
};
