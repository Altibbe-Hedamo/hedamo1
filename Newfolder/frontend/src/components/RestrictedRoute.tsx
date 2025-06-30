import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../pages/common/LoadingSpinner'; // Assuming you have a spinner component

interface RestrictedRouteProps {
  children: React.ReactNode;
}

const RestrictedRoute = ({ children }: RestrictedRouteProps) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return children;
};

export default RestrictedRoute;