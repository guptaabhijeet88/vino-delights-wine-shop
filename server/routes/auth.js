const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter — explicit SMTP config supporting ANY provider (Brevo, Mailjet, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify email transporter on startup (logs to Render console)
transporter.verify()
  .then(() => console.log('✅ Email transporter ready — Gmail credentials are valid'))
  .catch((err) => console.error('❌ Email transporter NOT ready:', err.message, '| Code:', err.code));

const https = require('https');

// Helper: sendMail with a hard timeout (prevents infinite hang)
function sendMailWithTimeout(mailOptions, timeoutMs = 20000) {
  // Check if we are using Brevo's SMTP server host, which tells us to route via REST API to avoid port blocks
  if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('brevo')) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Brevo REST API sending timed out after ' + timeoutMs + 'ms')), timeoutMs);
      
      const apiKey = process.env.EMAIL_PASS;
      
      const emailPayload = JSON.stringify({
        sender: {
          name: "Vino Delights 🍷",
          email: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html
      });

      const reqOptions = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(emailPayload)
        }
      };

      const req = https.request(reqOptions, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          clearTimeout(timeout);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseBody);
          } else {
            console.error('Brevo REST API Error:', responseBody);
            reject(new Error('Brevo REST API Failed: ' + res.statusCode));
          }
        });
      });

      req.on('error', (e) => {
        clearTimeout(timeout);
        reject(e);
      });

      req.write(emailPayload);
      req.end();
    });
  }

  // Fallback to regular Nodemailer transport for local host or other providers
  return Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email sending timed out after ' + timeoutMs + 'ms')), timeoutMs)
    ),
  ]);
}

// In-memory OTP store (email -> { otp, name, password, expiresAt })
const otpStore = new Map();

// Blocked disposable email domains
const blockedDomains = [
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'dispostable.com', 'trashmail.com',
  'fakeinbox.com', 'tempail.com', 'getnada.com', 'temp-mail.org',
  'maildrop.cc', 'harakirimail.com', 'discard.email', 'mailnesia.com',
  'guerrillamailblock.com', 'grr.la', 'spam4.me', 'trash-mail.com',
  'jetable.org', 'minutemail.com', '10minutemail.com', 'tempr.email'
];

// Clean expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(email);
  }
}, 10 * 60 * 1000);

// Step 1: Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Block disposable emails
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
      return res.status(400).json({ message: 'Temporary/disposable email addresses are not allowed' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with user data (expires in 5 minutes)
    otpStore.set(email.toLowerCase(), {
      otp,
      name,
      password,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send OTP email (with timeout to prevent hanging on cloud servers)
    await sendMailWithTimeout({
      from: `"Vino Delights 🍷" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Vino Delights',
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #722f37, #4a1a20); padding: 32px; text-align: center;">
            <h1 style="color: #f4e4c1; margin: 0; font-size: 28px;">🍷 Vino Delights</h1>
            <p style="color: rgba(244, 228, 193, 0.7); margin: 8px 0 0; font-size: 14px;">Premium Wine Shop</p>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="color: #ccc; font-size: 15px; margin-bottom: 8px;">Hi <strong style="color: #f4e4c1;">${name}</strong>,</p>
            <p style="color: #999; font-size: 14px; margin-bottom: 24px;">Use this code to verify your email address:</p>
            <div style="background: #2a2a4a; border: 2px solid #722f37; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #c5a572;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 24px;">This code expires in <strong style="color: #c5a572;">5 minutes</strong></p>
            <p style="color: #555; font-size: 11px; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('❌ OTP send error:', {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
    });

    // Provide a more specific error message
    let userMessage = 'Failed to send OTP. Please try again.';
    if (error.code === 'EAUTH') {
      userMessage = 'Email service authentication failed. Please contact support.';
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      userMessage = 'Email service is temporarily unavailable. Please try again later.';
    }

    res.status(500).json({ message: userMessage, error: error.message });
  }
});

// Step 2: Verify OTP and create account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = otpStore.get(email.toLowerCase());
    if (!stored) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — create user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name: stored.name,
      email,
      password: stored.password,
    });
    await user.save();

    // Clean up OTP
    otpStore.delete(email.toLowerCase());

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register (kept as fallback, but frontend uses send-otp + verify-otp)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
      return res.status(400).json({ message: 'Temporary/disposable email addresses are not allowed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: googleId + process.env.JWT_SECRET,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed', error: error.message });
  }
});

module.exports = router;
