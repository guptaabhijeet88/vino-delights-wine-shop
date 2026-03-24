const mongoose = require('mongoose');

const passwordResetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete expired OTPs (MongoDB TTL index)
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure only one reset OTP per email at a time
passwordResetOtpSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);
