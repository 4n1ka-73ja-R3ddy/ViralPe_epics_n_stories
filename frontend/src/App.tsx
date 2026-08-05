import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import CashbackPage from './pages/CashbackPage';
import ReferralPage from './pages/ReferralPage';
import PincodeChampionshipPage from './pages/PincodeChampionshipPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import AdminRoyaltyPage from './pages/AdminRoyaltyPage';
import AdminPlatformPage from './pages/AdminPlatformPage';
import AdminProviderOrchestrationPage from './pages/AdminProviderOrchestrationPage';
import RechargePage from './pages/RechargePage';
import BillPaymentPage from './pages/BillPaymentPage';
import VoucherPage from './pages/VoucherPage';
import MyVouchersPage from './pages/MyVouchersPage';
import WalletPage from './pages/WalletPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
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

function RequireAdminRole({ children }: { children: JSX.Element }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (session.email !== 'anikatejareddy0003@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
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
        path="/recharge"
        element={
          <RequireCompletedProfile>
            <RechargePage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/bills"
        element={
          <RequireCompletedProfile>
            <BillPaymentPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/vouchers"
        element={
          <RequireCompletedProfile>
            <VoucherPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/my-vouchers"
        element={
          <RequireCompletedProfile>
            <MyVouchersPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/wallet"
        element={
          <RequireCompletedProfile>
            <WalletPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/about"
        element={<AboutPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
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
        path="/cashback"
        element={
          <RequireCompletedProfile>
            <CashbackPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/referral"
        element={
          <RequireCompletedProfile>
            <ReferralPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/championship"
        element={
          <RequireCompletedProfile>
            <PincodeChampionshipPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/pincode-championship"
        element={
          <RequireCompletedProfile>
            <PincodeChampionshipPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/transactions"
        element={
          <RequireCompletedProfile>
            <TransactionHistoryPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/history"
        element={
          <RequireCompletedProfile>
            <TransactionHistoryPage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireCompletedProfile>
            <ProfilePage />
          </RequireCompletedProfile>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdminRole>
            <AdminPlatformPage />
          </RequireAdminRole>
        }
      />

      <Route
        path="/admin/royalty"
        element={
          <RequireAdminRole>
            <AdminRoyaltyPage />
          </RequireAdminRole>
        }
      />

      <Route
        path="/admin/orchestration"
        element={
          <RequireAdminRole>
            <AdminProviderOrchestrationPage />
          </RequireAdminRole>
        }
      />

      <Route
        path="/admin/providers"
        element={
          <RequireAdminRole>
            <AdminProviderOrchestrationPage />
          </RequireAdminRole>
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