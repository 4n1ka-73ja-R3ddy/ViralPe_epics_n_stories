import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import { getSession } from './lib/session';

function RequireSession({ children }: { children: JSX.Element }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RequireCompletedProfile({
  children
}: {
  children: JSX.Element;
}) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (!session.profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
// developed by anika teja reddy
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/onboarding"
        element={
          <RequireSession>
            <OnboardingPage />
          </RequireSession>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireCompletedProfile>
            <DashboardPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/checkout"
        element={
          <RequireCompletedProfile>
            <CheckoutPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;