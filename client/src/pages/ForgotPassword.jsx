import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/forgot-password`, { email });
      setSuccess(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      const last = document.getElementById('otp-5');
      if (last) last.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setSuccess('');
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/reset-password`, {
        email,
        otp: otp.join(''),
        newPassword,
      });
      setSuccess(res.data.message);
      setStep(4); // success state
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Email', 'Verify', 'Reset'];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '36px', marginBottom: '8px' }}>🔑</div>
        <h1>{step === 4 ? 'All Done!' : 'Reset Password'}</h1>
        <p className="auth-subtitle">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && 'Enter the 6-digit code sent to your email'}
          {step === 3 && 'Choose a new password for your account'}
          {step === 4 && 'Your password has been reset successfully'}
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="step-indicator">
            {stepLabels.map((label, i) => (
              <div key={i} className={`step-dot ${i + 1 <= step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}>
                <div className="step-circle">
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
        {success && step !== 4 && <div className="auth-success">{success}</div>}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button type="submit" className="btn-primary" disabled={otp.join('').length !== 6}>
              Verify Code
            </button>
            <button
              type="button"
              className="btn-text"
              onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); setSuccess(''); }}
            >
              ← Back to email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="reset-success">
            <div className="success-icon">✅</div>
            <p className="auth-success">{success}</p>
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '16px' }}>
              Sign In Now
            </Link>
          </div>
        )}

        <div className="auth-switch">
          Remember your password? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
