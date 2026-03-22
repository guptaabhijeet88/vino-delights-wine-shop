import { useState, useEffect } from 'react';

const DEMO_CARDS = {
  visa: { number: '4111 1111 1111 1111', expiry: '12/28', cvv: '123', name: 'DEMO USER' },
  mastercard: { number: '5500 0000 0000 0004', expiry: '06/27', cvv: '456', name: 'DEMO USER' },
};

export default function PaymentModal({ amount, onSuccess, onClose }) {
  const [tab, setTab] = useState('card');
  const [step, setStep] = useState('form'); // form → processing → success
  const [card, setCard] = useState({ ...DEMO_CARDS.visa });
  const [upiId, setUpiId] = useState('demo@upi');
  const [selectedCard, setSelectedCard] = useState('visa');

  const handleCardSelect = (type) => {
    setSelectedCard(type);
    setCard({ ...DEMO_CARDS[type] });
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        {step === 'form' && (
          <>
            {/* Header */}
            <div className="pm-header">
              <div className="pm-header-left">
                <div className="pm-logo">🍷</div>
                <div>
                  <div className="pm-title">Vino Delights</div>
                  <div className="pm-subtitle">Secure Demo Payment</div>
                </div>
              </div>
              <button className="pm-close" onClick={onClose}>✕</button>
            </div>

            {/* Amount Bar */}
            <div className="pm-amount-bar">
              <span>Total Amount</span>
              <span className="pm-amount">₹{amount.toLocaleString()}</span>
            </div>

            {/* Tabs */}
            <div className="pm-tabs">
              <button
                className={`pm-tab ${tab === 'card' ? 'active' : ''}`}
                onClick={() => setTab('card')}
              >
                💳 Card
              </button>
              <button
                className={`pm-tab ${tab === 'upi' ? 'active' : ''}`}
                onClick={() => setTab('upi')}
              >
                📱 UPI
              </button>
              <button
                className={`pm-tab ${tab === 'netbanking' ? 'active' : ''}`}
                onClick={() => setTab('netbanking')}
              >
                🏦 Net Banking
              </button>
            </div>

            {/* Card Tab */}
            {tab === 'card' && (
              <div className="pm-body">
                <div className="pm-demo-badge">🔒 Demo Mode — No real charges</div>

                <div className="pm-card-select">
                  <button
                    className={`pm-card-type ${selectedCard === 'visa' ? 'active' : ''}`}
                    onClick={() => handleCardSelect('visa')}
                  >
                    <span className="pm-card-brand">VISA</span>
                  </button>
                  <button
                    className={`pm-card-type ${selectedCard === 'mastercard' ? 'active' : ''}`}
                    onClick={() => handleCardSelect('mastercard')}
                  >
                    <span className="pm-card-brand mc">MC</span>
                  </button>
                </div>

                {/* Card Preview */}
                <div className="pm-card-preview">
                  <div className="pm-card-chip"></div>
                  <div className="pm-card-number">{card.number}</div>
                  <div className="pm-card-details">
                    <div>
                      <div className="pm-card-label">CARDHOLDER</div>
                      <div className="pm-card-value">{card.name}</div>
                    </div>
                    <div>
                      <div className="pm-card-label">EXPIRES</div>
                      <div className="pm-card-value">{card.expiry}</div>
                    </div>
                  </div>
                </div>

                <div className="pm-form-grid">
                  <div className="pm-field full">
                    <label>Card Number</label>
                    <input value={card.number} readOnly />
                  </div>
                  <div className="pm-field">
                    <label>Expiry</label>
                    <input value={card.expiry} readOnly />
                  </div>
                  <div className="pm-field">
                    <label>CVV</label>
                    <input value={card.cvv} type="password" readOnly />
                  </div>
                  <div className="pm-field full">
                    <label>Cardholder Name</label>
                    <input value={card.name} readOnly />
                  </div>
                </div>

                <button className="pm-pay-btn" onClick={handlePay}>
                  Pay ₹{amount.toLocaleString()}
                </button>
              </div>
            )}

            {/* UPI Tab */}
            {tab === 'upi' && (
              <div className="pm-body">
                <div className="pm-demo-badge">🔒 Demo Mode — No real charges</div>

                <div className="pm-upi-section">
                  <div className="pm-qr-box">
                    <div className="pm-qr-placeholder">
                      <div className="pm-qr-grid">
                        {Array.from({ length: 49 }).map((_, i) => (
                          <div key={i} className={`pm-qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`} />
                        ))}
                      </div>
                      <div className="pm-qr-label">Scan with any UPI app</div>
                    </div>
                  </div>

                  <div className="pm-upi-divider">
                    <span>OR</span>
                  </div>

                  <div className="pm-field full">
                    <label>UPI ID</label>
                    <input
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>

                <button className="pm-pay-btn" onClick={handlePay}>
                  Pay ₹{amount.toLocaleString()}
                </button>
              </div>
            )}

            {/* Net Banking Tab */}
            {tab === 'netbanking' && (
              <div className="pm-body">
                <div className="pm-demo-badge">🔒 Demo Mode — No real charges</div>

                <div className="pm-banks-grid">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'BOB'].map(bank => (
                    <button key={bank} className="pm-bank-btn" onClick={handlePay}>
                      <div className="pm-bank-icon">🏦</div>
                      <div className="pm-bank-name">{bank}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pm-footer">
              <span>🔒 Secured by</span>
              <span className="pm-footer-brand">Vino Pay™</span>
              <span className="pm-footer-demo">(Demo Gateway)</span>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="pm-processing">
            <div className="pm-spinner">
              <div className="pm-spinner-ring"></div>
              <div className="pm-spinner-icon">🍷</div>
            </div>
            <h3>Processing Payment</h3>
            <p>Please wait while we verify your payment...</p>
            <div className="pm-processing-amount">₹{amount.toLocaleString()}</div>
            <div className="pm-processing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="pm-success">
            <div className="pm-success-check">
              <svg viewBox="0 0 52 52" className="pm-checkmark">
                <circle className="pm-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="pm-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3>Payment Successful!</h3>
            <div className="pm-success-amount">₹{amount.toLocaleString()}</div>
            <p>Your order has been confirmed</p>
            <div className="pm-success-confetti">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="pm-confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#C5A572', '#722F37', '#8B3A42', '#D4B88A', '#F5F0EB'][Math.floor(Math.random() * 5)]
                }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
