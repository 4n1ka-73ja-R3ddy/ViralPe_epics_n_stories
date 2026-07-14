import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Complete Your Profile</h1>
        <p>Enter your pincode and optionally a referral or vendor code.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pincode</label>
            <input
              className="input"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="6-digit pincode"
              required
            />
          </div>
          <div className="form-group">
            <label>Referral / Onboarding Code</label>
            <input
              className="input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Optional code"
            />
          </div>
          <button type="submit" className="button">
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
