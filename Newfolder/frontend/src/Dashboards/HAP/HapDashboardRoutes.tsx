import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../../pages/HAP/Dashboard';
import Profile from '../../pages/HAP/Profile';
import CreateCompany from '../../pages/HAP/CreateCompany';
import ManageCompany from '../../pages/HAP/ManageCompany';
// import CreateProduct from '../../pages/Hap/CreateProduct';
// import ManageProduct from '../../pages/Hap/ManageProduct';
// import OrdersPage from '../../pages/Hap/OrdersPage';
import CommunicationCentrePage from '../../pages/HAP/CommunicationCentrePage';
import HelpLinePage from '../../pages/HAP/HelpLinePage';
import Sidebar from '../../components/slider';
import type { JSX } from 'react';
import LoadingSpinner from '../../pages/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.type !== 'hap') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HapDashboardRoutes = () => {
  useContext(AuthContext);
  const [activeSection, setActiveSection] = useState<string>('');

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/hap-portal/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/create-company"
            element={<ProtectedRoute><CreateCompany /></ProtectedRoute>}
          />
          <Route
            path="/manage-company"
            element={<ProtectedRoute><ManageCompany /></ProtectedRoute>}
          />
          {/* <Route
            path="/create-product"
            element={<ProtectedRoute><CreateProduct /></ProtectedRoute>}
          />
          <Route
            path="/manage-product"
            element={<ProtectedRoute><ManageProduct /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
          /> */}
          <Route
            path="/communication"
            element={<ProtectedRoute><CommunicationCentrePage /></ProtectedRoute>}
          />
          <Route
            path="/help-line"
            element={<ProtectedRoute><HelpLinePage /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/hap-portal/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default HapDashboardRoutes; 