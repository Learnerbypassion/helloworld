/**
 * MediKiosk -- OTP Service
 *
 * Uses Twilio Verify when TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_VERIFY_SID
 * are configured. Falls back to demo in-memory OTP otherwise.
 *
 * Call printStartupWarning() from server.js so the demo-mode warning
 * is always visible on startup -- prevents silent production accidents.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SID   = process.env.TWILIO_VERIFY_SID;

const TWILIO_ENABLED =
  TWILIO_ACCOUNT_SID &&
  TWILIO_AUTH_TOKEN  &&
  TWILIO_VERIFY_SID  &&
  TWILIO_ACCOUNT_SID !== "your_twilio_account_sid";

const demoOtpStore = new Map();   // { phone -> { otp, expiresAt } }
const DEMO_OTP = "123456";        // Fixed demo OTP

let twilioClient = null;
if (TWILIO_ENABLED) {
  try {
    twilioClient = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log("[otpService] Twilio Verify configured -- real SMS OTP enabled");
  } catch (e) {
    console.warn("[otpService] twilio package error:", e.message, "-- falling back to demo OTP");
  }
}

function printStartupWarning() {
  if (!TWILIO_ENABLED) {
    console.warn("============================================================");
    console.warn("WARNING: OTP VERIFICATION IS DISABLED");
    console.warn("  Twilio credentials not set in .env");
    console.warn("  Demo OTP '123456' accepts ALL logins.");
    console.warn("  DO NOT deploy this configuration to production.");
    console.warn("============================================================");
  }
}

async function sendOtp(phone) {
  if (TWILIO_ENABLED && twilioClient) {
    await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verifications.create({ to: phone, channel: "sms" });
    return { sent: true, demo: false };
  }
  // Demo mode: store and log (masked phone)
  demoOtpStore.set(phone, { otp: DEMO_OTP, expiresAt: Date.now() + 10 * 60 * 1000 });
  const masked = phone.length > 4 ? phone.slice(0,-4).replace(/./g,"*") + phone.slice(-4) : phone;
  console.log(`[otpService][DEMO] OTP for ${masked}: ${DEMO_OTP}`);
  return { sent: true, demo: true, demoOtp: DEMO_OTP };
}

async function verifyOtp(phone, otp) {
  if (TWILIO_ENABLED && twilioClient) {
    const check = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code: otp });
    return check.status === "approved";
  }
  // Demo mode
  if (otp === DEMO_OTP) return true;
  const stored = demoOtpStore.get(phone);
  if (stored && stored.otp === otp && stored.expiresAt > Date.now()) {
    demoOtpStore.delete(phone);
    return true;
  }
  return false;
}

module.exports = { sendOtp, verifyOtp, printStartupWarning, TWILIO_ENABLED };
