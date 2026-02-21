import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
  requireFounder?: boolean;
}

export default function AdminRoute({ children, requireFounder = false }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_step < 5) return <Navigate to="/claim-account/onboarding" replace />;

  if (requireFounder) {
    if (user.role !== 'founder') return <Navigate to="/dashboard" replace />;
  } else {
    if (user.role !== 'admin' && user.role !== 'founder') return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
