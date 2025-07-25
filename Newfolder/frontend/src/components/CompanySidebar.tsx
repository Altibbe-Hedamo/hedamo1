import React, { useContext } from 'react';
import {
  FaUser, FaDatabase, FaBox, FaBook, FaCalculator, FaWallet, FaBell, FaHeadset, FaGavel, FaFileInvoiceDollar, FaComments, FaUsers, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const companySidebarItems = [
  { section: 'profile', path: '/company-portal/profile', icon: FaUser, label: 'Profile' },
  { section: 'horizon-data', path: '/company-portal/horizon-data', icon: FaDatabase, label: 'Horizon Data' },
  { section: 'product-page', path: '/company-portal/product-page', icon: FaBox, label: 'Product page' },
  { section: 'ledger', path: '/company-portal/ledger', icon: FaBook, label: 'Ledger' },
  { section: 'price-calculator', path: '/company-portal/price-calculator', icon: FaCalculator, label: 'Price Calculator' },
  { section: 'payments', path: '/company-portal/payments', icon: FaWallet, label: 'Payments' },
  { section: 'renewal-reminders', path: '/company-portal/renewal-reminders', icon: FaBell, label: 'Renewal remainders' },
  { section: 'help-line', path: '/company-portal/help-line', icon: FaHeadset, label: 'Help Line' },
  { section: 'legal-resources', path: '/company-portal/legal-resources', icon: FaGavel, label: 'Legal Resources' },
  { section: 'invoicing', path: '/company-portal/invoicing', icon: FaFileInvoiceDollar, label: 'Invoicing' },
  { section: 'communication-center', path: '/company-portal/communication-center', icon: FaComments, label: 'Communication Center' },
  { section: 'customer-care', path: '/company-portal/customer-care', icon: FaUsers, label: 'Customer Care' },
];

const CompanySidebar: React.FC<{ activeSection: string; setActiveSection: (section: string) => void }> = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const isActive = (section: string) => activeSection === section;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 z-20 h-min-screen w-64 bg-[#1A3C34] text-white p-4 flex flex-col relative transition-all duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:w-64 md:min-h-screen">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-8 p-2 rounded-lg bg-[#2A5C54]">
        <h1 className="text-xl font-bold flex items-center">
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
            Company Portal
          </span>
        </h1>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Active Now"></div>
      </div>
      <nav className="flex-1">
        <ul role="navigation" aria-label="Main navigation" className="space-y-1">
          {companySidebarItems.map(({ section, path, icon: Icon, label }) => (
            <li
              key={section}
              className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer ${isActive(section) ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
              onClick={() => { setActiveSection(section); navigate(path); }}
              aria-current={isActive(section) ? 'page' : undefined}
            >
              <Icon className={`mr-3 ${isActive(section) ? 'text-blue-300' : 'text-gray-300'}`} />
              <span className={isActive(section) ? 'font-medium text-white' : 'text-gray-300'}>{label}</span>
            </li>
          ))}
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
              {user ? `${user.name?.[0] || 'C'}` : 'C'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {user ? user.name : 'Company User'}
            </p>
            <p className="text-xs text-gray-400">Company</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySidebar; 