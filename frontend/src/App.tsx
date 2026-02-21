import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import UploadImage from './pages/UploadImage';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ClaimAccount from './pages/ClaimAccount';
import OnboardingWizard from './pages/OnboardingWizard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminUsers from './pages/admin/AdminUsers';
import ConfirmEmailChange from './pages/ConfirmEmailChange';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/claim-account" element={<ClaimAccount />} />
            <Route path="/claim-account/onboarding" element={<OnboardingWizard />} />
            <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <Layout><CreateQuiz /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Layout><UploadImage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <ProtectedRoute>
                  <Layout><TakeQuiz /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id/results"
              element={
                <ProtectedRoute>
                  <Layout><QuizResults /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Layout><Stats /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout><AdminAccounts /></AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <AdminRoute>
                  <AdminLayout><AdminAccounts /></AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute requireFounder>
                  <AdminLayout><AdminUsers /></AdminLayout>
                </AdminRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
