// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, role: userRole } = useSelector(state => state.auth);

  if (!isAuthenticated || userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
