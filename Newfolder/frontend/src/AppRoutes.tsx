import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './components/ForgotPassword';
import BuyCertificate from './components/BuyCertificate';
import Contact from './pages/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import SetPassword from './components/SetPassword';
import ProductsPage from './pages/Product';
import AgentDashboardRoutes from './Dashboards/Agent/AgentDashboardRoutes';
import AdminDashboardRoutes from './Dashboards/Admin/AdminDashboardRoutes';
import CareerPage from './pages/CareerPage';
import HRDashboardRoutes from './Dashboards/HR/HRDashboardRoutes';
import Services from './pages/Services';
import QRReports from './pages/QRReports';
import Producers from './pages/Producers';
import Marketplace from './pages/Marketplace';
import MarketplaceHowItWorks from './pages/MarketplaceHowItWorks';
import ProducersHowItWorks from './pages/ProducersHowItWorks';
import QRReportsHowItWorks from './pages/QRReportsHowItWorks';
import JobApplicationPage from './pages/JobApplicationPage';
import Process from './pages/Process';
import HapPortal from './pages/HapPortal';
import CreateCompany from './pages/HAP/CreateCompany';
import ManageCompany from './pages/HAP/ManageCompany';
import KYCVerification from './pages/Agent/KYCVerification';
import ChannelPartnerPortal from './pages/ChannelPartner/ChannelPartnerPortal';
import UserProfile from './pages/UserProfile';
import UserProfileHome from './pages/UserProfileHome';
import ProductsMap from './pages/ProductsMap';
import Wishlist from './pages/Wishlist';
import Directories from './pages/Directories';
import LoadingSpinner from './pages/common/LoadingSpinner';
import CompanyPortal from './pages/Company/CompanyPortal';
import IntakeFormPage from './pages/Company/IntakeFormPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Don't show the main navbar on any portal or dashboard pages
  const portalPaths = [
    '/hap-portal',
    '/agent-dashboard',
    '/admin-dashboard',
    '/hr-dashboard',
    '/channel-partner-portal',
    '/company-portal',
    '/user-profile'
  ];
  const showNavbar = !portalPaths.some(path => location.pathname.startsWith(path));

  return (
    <div>
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Don't show navbar on login, signup, and password pages
  const showNavbar = !['/login', '/signup', '/forgot-password', '/set-password'].includes(location.pathname);

  return (
    <div>
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      <Route path="/about" element={
        <PublicRoute>
          <About />
        </PublicRoute>
      } />
      <Route path="/contact" element={
        <PublicRoute>
          <Contact />
        </PublicRoute>
      } />
      <Route
        path="/hap-portal/*"
        element={
          <ProtectedRoute>
            <HapPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hap-portal/create-company"
        element={
          <ProtectedRoute>
            <CreateCompany />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hap-portal/manage-company"
        element={
          <ProtectedRoute>
            <ManageCompany />
          </ProtectedRoute>
        }
      />
      <Route path="/buy-certificate" element={<BuyCertificate />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/careers" element={<CareerPage />} />
      <Route path="/services" element={<Services />} />
      <Route path="/qr-reports" element={<QRReports />} />
      <Route path="/producers" element={<Producers />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/how-it-works" element={<MarketplaceHowItWorks />} />
      <Route path="/producers/how-it-works" element={<ProducersHowItWorks />} />
      <Route path="/qr-reports/how-it-works" element={<QRReportsHowItWorks />} />
      <Route path="/job-application" element={<JobApplicationPage />} />
      <Route path="/process" element={<Process />} />
      <Route
        path="/user-profile/*"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserProfileHome />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products-map" element={<ProductsMap />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="directories" element={<Directories />} />
      </Route>
      <Route
        path="/kyc-verification"
        element={
          <ProtectedRoute>
            <KYCVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-dashboard/*"
        element={
          <ProtectedRoute>
            <AgentDashboardRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/*"
        element={
          <ProtectedRoute>
            <AdminDashboardRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard/*"
        element={
          <ProtectedRoute>
            <HRDashboardRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel-partner-portal/*"
        element={
          <ProtectedRoute>
            <ChannelPartnerPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-portal/*"
        element={
          <ProtectedRoute>
            <CompanyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-portal/intake-form/:productId"
        element={
          <ProtectedRoute>
            <IntakeFormPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;