const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a JWT
const generateJWT = (payload, expiresIn = "1h") => {
  const options = {
    expiresIn: expiresIn, // Token expiration time, e.g., '1h', '2d'
    notBefore: "0", // Token becomes valid immediately
  };
  return jwt.sign(payload, JWT_SECRET, options);
};
// Function to decode a JWT (without verifying)
const decodeJWT = (token) => {
  return jwt.decode(token, { complete: true });
};

// Function to verify a JWT
const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, expired: false, decoded };
  } catch (err) {
    return {
      valid: false,
      expired: err.message.includes("jwt expired"),
      decoded: null,
    };
  }
};

const generateURLSafeEncryption = (payload, expiresIn = "24h") => {
  const token = generateJWT(payload, expiresIn);
  const base64Encoded = Buffer.from(token).toString("base64url");
  return base64Encoded;
};

const decodeURLSafeEncryption = (base64Encoded) => {
  const token = Buffer.from(base64Encoded, "base64url").toString("utf-8");
  const verification = verifyJWT(token);

  return verification;
};

module.exports = {
  generateJWT,
  decodeJWT,
  verifyJWT,
  generateURLSafeEncryption,
  decodeURLSafeEncryption,
};
