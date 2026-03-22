import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

export default function Register() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Blocked disposable email domains
  const blockedDomains = [
    'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
    'yopmail.com', 'sharklasers.com', 'dispostable.com', 'trashmail.com',
    'fakeinbox.com', 'tempail.com', 'getnada.com', 'temp-mail.org',
    'maildrop.cc', 'harakirimail.com', 'discard.email', 'mailnesia.com',
    'guerrillamailblock.com', 'grr.la', 'spam4.me', 'trash-mail.com',
    'jetable.org', 'minutemail.com', '10minutemail.com', 'tempr.email'
  ];

  // Start countdown timer
  const startTimer = () => {
    setOtpTimer(300); // 5 minutes
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Validate form and send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Block disposable email domains
    const emailDomain = form.email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
      setError('Temporary/disposable email addresses are not allowed. Please use a real email.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        email: form.email,
        otp,
      });
      localStorage.setItem('vino_token', res.data.token);
      window.location.href = '/shop'; // Full reload to update auth state
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      startTimer();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '36px', marginBottom: '8px' }}>🍷</div>
        <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
        <p className="auth-subtitle">
          {step === 1
            ? 'Join the Vino Delights experience'
            : <>We sent a 6-digit code to <strong style={{ color: 'var(--gold)' }}>{form.email}</strong></>
          }
        </p>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <>
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-up failed')}
                theme="filled_black"
                size="large"
                width="100%"
                text="signup_with"
                shape="pill"
              />
            </div>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending OTP...' : '📧 Send Verification Code'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }}
              />
            </div>

            {otpTimer > 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                Code expires in <span style={{ color: 'var(--gold)', fontWeight: '600' }}>{formatTime(otpTimer)}</span>
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : '✅ Verify & Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpTimer > 240}
                style={{
                  background: 'none',
                  border: 'none',
                  color: otpTimer > 240 ? 'var(--text-muted)' : 'var(--gold)',
                  cursor: otpTimer > 240 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline'
                }}
              >
                Resend OTP
              </button>
              <span style={{ color: 'var(--text-muted)', margin: '0 12px' }}>•</span>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
