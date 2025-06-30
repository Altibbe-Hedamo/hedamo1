import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { FaHome, FaUser, FaBox, FaClipboardList, FaComments, FaHeadset, FaBook } from 'react-icons/fa';
import LedgerPage from './HapPortal/LedgerPage';
import HelpLinePage from './HAP/HelpLinePage';
import CommunicationCentrePage from './HAP/CommunicationCentrePage';
import Profile from './HAP/Profile';
import EditProfile from './HAP/EditProfile';
import CreateProfile from './HAP/CreateProfile';

const HapPortal: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/hap-portal/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/hap-portal/profile', icon: FaUser, label: 'Profile' },
    { path: '/hap-portal/products', icon: FaBox, label: 'Products' },
    { path: '/hap-portal/orders', icon: FaClipboardList, label: 'Orders' },
    { path: '/hap-portal/communication', icon: FaComments, label: 'Communication' },
    { path: '/hap-portal/help-line', icon: FaHeadset, label: 'Help Line' },
    { path: '/hap-portal/ledger', icon: FaBook, label: 'Ledger' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-[#1A3C38] text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-xl font-bold ${!isSidebarOpen && 'hidden'}`}>HAP Portal</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#2A5C54] transition-colors"
            >
              {isSidebarOpen ? '←' : '→'}
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#2A5C54] text-white'
                        : 'text-gray-300 hover:bg-[#2A5C54] hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/help-line" element={<HelpLinePage />} />
          <Route path="/communication" element={<CommunicationCentrePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-6">Welcome to HAP Portal</h1>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Active Products</h3>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600">$0</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-500">No recent activity to display.</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate('/hap-portal/create-company')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create New Company
                    </button>
                    <button
                      onClick={() => navigate('/hap-portal/create-product')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add New Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default HapPortal; 