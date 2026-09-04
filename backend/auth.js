/**
 * MediKiosk — role-based authentication.
 *
 * Three roles:
 *   hospital_admin  — registers the hospital, adds/removes doctors, manages patients
 *   doctor          — logs in, sees queue/dashboard, reviews patients
 *   patient         — kiosk / patient-portal identity, own record only
 *
 * JWT payload: { role, id, hospital_id, name }
 */
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "medikiosk-dev-secret-change-me";
const TOKEN_TTL = "12h";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// requireRole('doctor', 'hospital_admin') -> passes if req.user.role is one of these
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole, JWT_SECRET };
