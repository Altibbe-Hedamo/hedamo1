import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../../pages/Agent/Dashboard';
import Profile from '../../pages/Agent/Profile';
import CreateProfile from '../../pages/Agent/CreateProfile';
import CreateCompany from '../../pages/Agent/CreateCompany';
import ManageCompany from '../../pages/Agent/ManageCompany';
import CreateProduct from '../../pages/Agent/CreateProduct';
import ManageProduct from '../../pages/Agent/ManageProduct';
import Wallet from '../../pages/Agent/Wallet';
import Payments from '../../pages/Agent/Payments';
import WaitingApproval from '../../pages/Agent/WaitingApproval';
import AgentDashboard from '../../pages/Agent/Dashboard';
import Sidebar from '../../components/slider';
import EditProfile from '../../pages/Agent/EditProfile';
import EditCompany from '../../pages/Agent/EditCompany';
import ReportsPage from '../../pages/Agent/ReportsPage';
import HvpLedgerPage from '../../pages/Agent/HvpLedgerPage';
import HelpLinePage from '../../pages/Agent/HelpLinePage';
import ClientInvoicingPage from '../../pages/Agent/ClientInvoicingPage';
import OrdersPage from '../../pages/Agent/OrdersPage';
import CommunicationCentrePage from '../../pages/Agent/CommunicationCentrePage';
import type { JSX } from 'react';
import LoadingSpinner from '../../pages/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user || user.type !== 'agent') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AgentDashboardRoutes = () => {
  const { user, isLoading } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState<string>('');

  if (!isLoading && user && user.type === 'agent' && user.status !== 'active') {
    // Only allow access to waiting approval page
    if (window.location.pathname !== '/agent-dashboard/waiting-approval') {
      window.location.href = '/agent-dashboard/waiting-approval';
      return null;
    }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/agent-dashboard/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/agent-dashboard"
            element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><CreateProfile /></ProtectedRoute>}
          />
          <Route
            path="/view-profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/create-profile"
            element={<ProtectedRoute><CreateProfile /></ProtectedRoute>}
          />
          <Route
            path="/edit-profile"
            element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
          />
          <Route
            path="/waiting-approval"
            element={<ProtectedRoute><WaitingApproval /></ProtectedRoute>}
          />
          <Route
            path="/report-page"
            element={<ProtectedRoute><ReportsPage /></ProtectedRoute>}
          />
          <Route
            path="/report-page/intake/:productId"
            element={null}
          />
          <Route
            path="/create-company"
            element={<ProtectedRoute><CreateCompany /></ProtectedRoute>}
          />
          <Route
            path="/manage-company"
            element={<ProtectedRoute><ManageCompany /></ProtectedRoute>}
          />
          <Route
            path="/edit-company/:id"
            element={<ProtectedRoute><EditCompany /></ProtectedRoute>}
          />
          <Route
            path="/create-product"
            element={<ProtectedRoute><CreateProduct /></ProtectedRoute>}
          />
          <Route
            path="/manage-product"
            element={<ProtectedRoute><ManageProduct /></ProtectedRoute>}
          />
          <Route
            path="/wallet"
            element={<ProtectedRoute><Wallet /></ProtectedRoute>}
          />
          <Route
            path="/payments"
            element={<ProtectedRoute><Payments /></ProtectedRoute>}
          />
          <Route
            path="/hvp-ledger"
            element={
              <ProtectedRoute>
                <HvpLedgerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-line"
            element={
              <ProtectedRoute>
                <HelpLinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-invoicing"
            element={
              <ProtectedRoute>
                <ClientInvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <ProtectedRoute>
                <CommunicationCentrePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/agent-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AgentDashboardRoutes;