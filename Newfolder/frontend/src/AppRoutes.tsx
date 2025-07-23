import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
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
// import HapPortal from './pages/HapPortal';
// import CreateCompany from './pages/HAP/CreateCompany';
// import ManageCompany from './pages/HAP/ManageCompany';
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
// import HrbPortal from './pages/HrbPortal';
// import HRBPortalRoutes from './pages/HRB/HRBPortalRoutes';
import Product1 from './pages/Product1';
import AgricultureCategory from './pages/categories/agriculture';
import ExploreHoneyVarieties from './pages/categories/agriculture/ExploreHoneyVarieties';
import HoneyVarietyDetail from './pages/categories/agriculture/HoneyVarietyDetail';
import SocialFeed from './pages/SocialFeed';
import SLPPage from './pages/Admin/SLPPage';

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
    // '/hap-portal',
    '/agent-dashboard',
    '/admin-dashboard',
    '/hr-dashboard',
    '/channel-partner-portal',
    '/company-portal',
    '/user-profile',
    // '/hrb-portal' // Hide Navbar on HRB portal
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

const NotFoundCategory = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 className="text-3xl font-bold text-red-700 mb-4">Category Not Found</h1>
    <p className="text-gray-700">The category you are looking for does not exist.</p>
  </div>
);

function kebabToFolderName(kebab: string) {
  // Convert kebab-case to folder name (e.g., 'meat-&-poultry' -> 'meat & poultry')
  return kebab.replace(/-/g, ' ');
}

function DynamicCategoryPage() {
  const { categoryName } = useParams();
  let CategoryComponent;
  try {
    // Try to import the category page using the kebab-case param
    CategoryComponent = React.lazy(() => import(`./pages/categories/${categoryName}/index.tsx`));
  } catch (e) {
    return <NotFoundCategory />;
  }
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CategoryComponent />
    </Suspense>
  );
}

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
      {/* <Route
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
      /> */}
      <Route path="/buy-certificate" element={<BuyCertificate />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product1" element={<Product1 />} />
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
      <Route path="/social-feed" element={<SocialFeed />} />
      <Route path="/Slp" element={<SLPPage />} />
      <Route path="/category/:categoryName" element={<DynamicCategoryPage />} />
      <Route path="/honey-varieties/:slug" element={<HoneyVarietyDetail />} />
      <Route path="/agriculture/honey-varieties" element={<Suspense fallback={<div>Loading...</div>}><ExploreHoneyVarieties /></Suspense>} />
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
      {/* <Route
        path="/hrb-portal/*"
        element={
          <ProtectedRoute>
            <HRBPortalRoutes />
          </ProtectedRoute>
        }
      /> */}
    </Routes>
  );
};

export default AppRoutes;