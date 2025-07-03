import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../pages/HR/Sidebar';
import DashboardSection from '../../pages/HR/DashboardSection';
import JobsSection from '../../pages/HR/JobsSection';
import ApplicationsSection from '../../pages/HR/ApplicationsSection';
import type { JSX } from 'react';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  console.log('HRDashboard ProtectedRoute - User:', user);
  return user && (user.type === 'hr' || user.type === 'admin') ? children : <Navigate to="/login" replace />;
};

const HRDashboardRoutes = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/hr-dashboard/dashboard" replace />} />
          
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardSection /></ProtectedRoute>}
          />
          
          <Route
            path="/jobs"
            element={<ProtectedRoute><JobsSection /></ProtectedRoute>}
          />
          
          <Route
            path="/applications"
            element={<ProtectedRoute><ApplicationsSection /></ProtectedRoute>}
          />
          
          <Route path="*" element={<Navigate to="/hr-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default HRDashboardRoutes;