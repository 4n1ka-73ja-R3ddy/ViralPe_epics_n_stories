import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to ViralPe</h1>
        <p>Start by signing in with Google or Apple and completing onboarding.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="button" onClick={() => navigate('/onboarding')}>
            Sign in with Google
          </button>
          <button className="button" onClick={() => navigate('/onboarding')}>
            Sign in with Apple
          </button>
        </div>
      </div>
    </div>
  );
}
