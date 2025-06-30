import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaIdCard, FaMoneyBillWave, FaLink, FaUsers, FaHeadset } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import LedgerPage from './LedgerPage';
import ChannelKYC from './ChannelKYC';
import CommissionPayments from './CommissionPayments';
import LinkGenerator from './LinkGenerator';
import Clients from './Clients';
import HelpLinePage from './HelpLinePage';

const ChannelPartnerPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/channel-partner-portal/kyc', icon: FaIdCard, label: 'KYC' },
    { path: '/channel-partner-portal/clients', icon: FaUsers, label: 'Clients' },
    { path: '/channel-partner-portal/ledger', icon: FaBook, label: 'Ledger' },
    { path: '/channel-partner-portal/commission', icon: FaMoneyBillWave, label: 'Commission & Payments' },
    { path: '/channel-partner-portal/link-generator', icon: FaLink, label: 'Link Generator' },
    { path: '/channel-partner-portal/help-line', icon: FaHeadset, label: 'Help Line' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-20 h-min-screen w-64 bg-[#1A3C34] text-white p-4 flex flex-col relative transition-all duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:w-64 md:min-h-screen`}>
        
        {/* Logo/Dashboard Header */}
        <div className="flex items-center justify-between mb-8 p-2 rounded-lg bg-[#2A5C54]">
          <h1 className="text-xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
              Channel Partner Portal
            </span>
          </h1>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Active Now"></div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={`p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer
                  ${isActive(item.path) ? 'bg-[#2A5C54] border-l-4 border-blue-300' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`mr-3 ${isActive(item.path) ? 'text-blue-300' : 'text-gray-300'}`} />
                <span className={isActive(item.path) ? 'font-medium text-white' : 'text-gray-300'}>{item.label}</span>
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
                {user ? `${user.name?.[0] || 'C'}` : 'CP'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {user ? user.name : 'Channel Partner'}
              </p>
              <p className="text-xs text-gray-400">Channel Partner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/channel-partner-portal/kyc" replace />} />
          <Route path="/kyc" element={<ChannelKYC />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/commission" element={<CommissionPayments />} />
          <Route path="/link-generator" element={<LinkGenerator />} />
          <Route path="/help-line" element={<HelpLinePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default ChannelPartnerPortal; 