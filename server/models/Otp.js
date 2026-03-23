const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete expired OTPs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure only one OTP per email at a time
otpSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);
