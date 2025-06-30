import { useState, useEffect, useContext } from 'react';
import { 
  FaTachometerAlt, FaUser, FaBuilding, FaBox, FaSignOutAlt, 
  FaWallet, FaChevronDown, FaChevronUp, FaPlus, 
  FaCog, FaHome, FaFileAlt, FaBook, FaHeadset,
  FaFileInvoiceDollar, FaClipboardList, FaComments
} from 'react-icons/fa';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen }) => {
  const [productMenuOpen, setProductMenuOpen] = useState<boolean>(true);
  const [companyMenuOpen, setCompanyMenuOpen] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isActive = (section: string) => activeSection === section;

  useEffect(() => {
    const fetchProfileAndUser = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const [userResponse] = await Promise.all([
          api.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(userResponse.data.user);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchProfileAndUser();
  }, []);

  const handleRestrictedClick = (section: string, path: string) => {
    setActiveSection(section);
    navigate(path);
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const restrictedSections = [
    { section: 'dashboard', path: '/agent-dashboard/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { section: 'profile', path: '/agent-dashboard/profile', icon: FaUser, label: 'Profile' },
  ];

  const companySubItems = [
    {
      section: 'createCompany',
      path: '/agent-dashboard/create-company',
      icon: FaPlus,
      label: 'Create Company',
    },
    {
      section: 'manageCompany',
      path: '/agent-dashboard/manage-company',
      icon: FaCog,
      label: 'Manage Company',
    },
  ];

  const productSubItems = [
    {
      section: 'createProduct',
      path: '/agent-dashboard/create-product',
      icon: FaPlus,
      label: 'Create Product',
    },
    {
      section: 'manageProduct',
      path: '/agent-dashboard/manage-product',
      icon: FaCog,
      label: 'Manage Product',
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 z-20 h-min-screen w-64 bg-[#1A3C34] text-white p-4 flex flex-col relative transition-all duration-300 ease-in-out overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-64 md:min-h-screen`}
      aria-hidden={isSidebarOpen === false ? 'true' : 'false'}
    >
      {/* Logo/Dashboard Header */}
      <div className="flex items-center justify-between mb-8 p-2 rounded-lg bg-[#2A5C54]">
        <h1 className="text-xl font-bold flex items-center">
          <FaHome className="mr-2 text-blue-300" />
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
            Agent Portal
          </span>
        </h1>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Active Now"></div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1">
        <ul role="navigation" aria-label="Main navigation" className="space-y-1">
          {restrictedSections.map(({ section, path, icon: Icon, label }) => (
            <li
              key={section}
              className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
                ${isActive(section) ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
              onClick={() => handleRestrictedClick(section, path)}
              aria-current={isActive(section) ? 'page' : undefined}
            >
              <Icon className={`mr-3 ${isActive(section) ? 'text-blue-300' : 'text-gray-300'}`} />
              <span className={isActive(section) ? 'font-medium text-white' : 'text-gray-300'}>{label}</span>
            </li>
          ))}

          {/* Company Section with Dropdown */}
          <div className="mt-2">
            <div
              className="flex items-center justify-between p-3 hover:bg-[#2A5C54] rounded-lg cursor-pointer"
              onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
              aria-expanded={companyMenuOpen}
              aria-label="Toggle Companies menu"
            >
              <div className="flex items-center">
                <FaBuilding className="mr-3 text-gray-300" />
                <span className="text-gray-300">Companies</span>
              </div>
              {companyMenuOpen ? (
                <FaChevronUp className="text-xs text-gray-400" />
              ) : (
                <FaChevronDown className="text-xs text-gray-400" />
              )}
            </div>

            {companyMenuOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                {companySubItems.map(({ section, path, icon: Icon, label }) => (
                  <li
                    key={section}
                    className={`p-2 pl-3 rounded-lg flex items-center transition-colors hover:bg-[#2A5C54] cursor-pointer
                      ${isActive(section) ? 'bg-[#2A5C54] border-l-2 border-blue-300' : ''}`}
                    onClick={() => handleRestrictedClick(section, path)}
                    aria-current={isActive(section) ? 'page' : undefined}
                  >
                    <Icon className={`mr-2 text-xs ${isActive(section) ? 'text-blue-300' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isActive(section) ? 'text-white' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Product Section with Dropdown */}
          <div className="mt-2">
            <div
              className="flex items-center justify-between p-3 hover:bg-[#2A5C54] rounded-lg cursor-pointer"
              onClick={() => setProductMenuOpen(!productMenuOpen)}
              aria-expanded={productMenuOpen}
              aria-label="Toggle Products menu"
            >
              <div className="flex items-center">
                <FaBox className="mr-3 text-gray-300" />
                <span className="text-gray-300">Products</span>
              </div>
              {productMenuOpen ? (
                <FaChevronUp className="text-xs text-gray-400" />
              ) : (
                <FaChevronDown className="text-xs text-gray-400" />
              )}
            </div>

            {productMenuOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                {productSubItems.map(({ section, path, icon: Icon, label }) => (
                  <li
                    key={section}
                    className={`p-2 pl-3 rounded-lg flex items-center transition-colors hover:bg-[#2A5C54] cursor-pointer
                      ${isActive(section) ? 'bg-[#2A5C54] border-l-2 border-blue-300' : ''}`}
                    onClick={() => handleRestrictedClick(section, path)}
                    aria-current={isActive(section) ? 'page' : undefined}
                  >
                    <Icon className={`mr-2 text-xs ${isActive(section) ? 'text-blue-300' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isActive(section) ? 'text-white' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reports Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('reports') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('reports', '/agent-dashboard/report-page')}
            aria-current={isActive('reports') ? 'page' : undefined}
          >
            <FaFileAlt className={`mr-3 ${isActive('reports') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('reports') ? 'font-medium text-white' : 'text-gray-300'}>Reports</span>
          </li>

          {/* Payments Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('payments') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('payments', '/agent-dashboard/payments')}
            aria-current={isActive('payments') ? 'page' : undefined}
          >
            <FaWallet className={`mr-3 ${isActive('payments') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('payments') ? 'font-medium text-white' : 'text-gray-300'}>Payments</span>
          </li>

          {/* HVP Ledger Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('hvp-ledger') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('hvp-ledger', '/agent-dashboard/hvp-ledger')}
            aria-current={isActive('hvp-ledger') ? 'page' : undefined}
          >
            <FaBook className={`mr-3 ${isActive('hvp-ledger') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('hvp-ledger') ? 'font-medium text-white' : 'text-gray-300'}>HVP Ledger</span>
          </li>

          {/* Help Line Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('help-line') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('help-line', '/agent-dashboard/help-line')}
            aria-current={isActive('help-line') ? 'page' : undefined}
          >
            <FaHeadset className={`mr-3 ${isActive('help-line') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('help-line') ? 'font-medium text-white' : 'text-gray-300'}>Help Line</span>
          </li>

          {/* Client Invoicing Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('client-invoicing') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('client-invoicing', '/agent-dashboard/client-invoicing')}
            aria-current={isActive('client-invoicing') ? 'page' : undefined}
          >
            <FaFileInvoiceDollar className={`mr-3 ${isActive('client-invoicing') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('client-invoicing') ? 'font-medium text-white' : 'text-gray-300'}>Client Invoicing</span>
          </li>

          {/* Orders Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('orders') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('orders', '/agent-dashboard/orders')}
            aria-current={isActive('orders') ? 'page' : undefined}
          >
            <FaClipboardList className={`mr-3 ${isActive('orders') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('orders') ? 'font-medium text-white' : 'text-gray-300'}>Orders</span>
          </li>

          {/* Communication Centre Section */}
          <li
            className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
              ${isActive('communication') ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
            onClick={() => handleRestrictedClick('communication', '/agent-dashboard/communication')}
            aria-current={isActive('communication') ? 'page' : undefined}
          >
            <FaComments className={`mr-3 ${isActive('communication') ? 'text-blue-300' : 'text-gray-300'}`} />
            <span className={isActive('communication') ? 'font-medium text-white' : 'text-gray-300'}>Communication Centre</span>
          </li>
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="mt-auto">
        <ul className="space-y-1">
          <li
            className="p-3 hover:bg-[#2A5C54] cursor-pointer rounded-lg flex items-center transition-colors text-red-300 hover:text-red-200"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </li>
        </ul>

        {/* User Profile Mini */}
        <div className="mt-6 p-3 bg-[#2A5C54] rounded-lg flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center mr-3">
            <span className="text-xs font-bold text-[#1A3C34]">
              {user ? `${user.first_name[0]}${user.last_name[0]}` : 'AU'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {user ? `${user.first_name} ${user.last_name}` : 'Agent User'}
            </p>
            <p className="text-xs text-gray-400">Agent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;