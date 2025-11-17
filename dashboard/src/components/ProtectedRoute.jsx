import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ redirectTo = '/login' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-state">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

