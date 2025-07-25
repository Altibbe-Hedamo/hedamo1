import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../pages/Admin/Sidebar';
import DashboardSection from '../../pages/Admin/DashboardSection';
import UsersSection from '../../pages/Admin/UsersSection';
import ProductsSection from '../../pages/Admin/ProductsSection';
import ReportsSection from '../../pages/Admin/ReportsSection';
import PaymentsSection from '../../pages/Admin/PaymentsSection';
import CompaniesSection from '../../pages/Admin/CompaniesSection';
import IntakeFormSection from '../../pages/Admin/IntakeFormSection';
import InvoicesSection from '../../pages/Admin/InvoicesSection';
import LedgerSection from '../../pages/Admin/LedgerSection';
import AdminCommunicationCenter from '../../pages/Admin/AdminCommunicationCenter';
import UsersPage from '../../pages/Admin/UsersPage';
import LegalDocumentPage from '../../pages/Admin/LegalDocumentPage';
import HelpLinePage from '../../pages/Admin/HelpLinePage';
import SLPPage from '../../pages/Admin/SLPPage';
import SLPRulesPage from '../../pages/Admin/SLPRulesPage';
import type { JSX } from 'react';
import LoadingSpinner from '../../pages/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return user && user.type === 'principaladmin' ? children : <Navigate to="/login" replace />;
};

const PrincipalAdminDashboardRoutes = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/principal-admin-dashboard/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardSection /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/legal-document" element={<ProtectedRoute><LegalDocumentPage /></ProtectedRoute>} />
          <Route path="/help-line" element={<ProtectedRoute><HelpLinePage /></ProtectedRoute>} />
          <Route path="/hvp" element={<ProtectedRoute><UsersSection /></ProtectedRoute>} />
          <Route path="/slp" element={<ProtectedRoute><UsersSection /></ProtectedRoute>} />
          <Route path="/users/agents" element={<ProtectedRoute><UsersSection /></ProtectedRoute>} />
          <Route path="/users/companies" element={<ProtectedRoute><UsersSection /></ProtectedRoute>} />
          <Route path="/users/users" element={<ProtectedRoute><UsersSection /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><CompaniesSection /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsSection /></ProtectedRoute>} />
          <Route path="/intake-form" element={<ProtectedRoute><IntakeFormSection /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsSection /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsSection /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesSection /></ProtectedRoute>} />
          <Route path="/ledger" element={<ProtectedRoute><LedgerSection /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><AdminCommunicationCenter /></ProtectedRoute>} />
          <Route path="/slp-rules" element={<ProtectedRoute><SLPRulesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/principal-admin-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalAdminDashboardRoutes; 