import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  DollarSign,
  Settings,
  LogOutIcon,
  Building2,
  Shield,
  ClipboardCheck,
  Receipt,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {  FaFileContract, FaHeadset } from 'react-icons/fa';


const Sidebar: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard/dashboard' },
    { name: 'Users', icon: Users, path: '/admin-dashboard/users' },
    { name: 'HVP', icon: Users, path: '/admin-dashboard/hvp' },
    { name: 'HAP', icon: Shield, path: '/admin-dashboard/hap' },
    { name: 'HRB', icon: ClipboardCheck, path: '/admin-dashboard/hrb' },
    { name: 'Companies', icon: Building2, path: '/admin-dashboard/companies' },
    { name: 'Products', icon: Package, path: '/admin-dashboard/products' },
    { name: 'Reports', icon: FileText, path: '/admin-dashboard/reports' },
    { name: 'Payments', icon: DollarSign, path: '/admin-dashboard/payments' },
    { name: 'Invoices', icon: Receipt, path: '/admin-dashboard/invoices' },
    { name: 'Ledger', icon: BookOpen, path: '/admin-dashboard/ledger' },
    { name: 'Communication Center', icon: MessageSquare, path: '/admin-dashboard/communication' },
    { name: 'Legal Document', icon: FaFileContract, path: '/admin-dashboard/legal-document' },
    { name: 'Help Line', icon: FaHeadset, path: '/admin-dashboard/help-line' },
  ];
  const { logout } = useContext(AuthContext);

  return (
    <div className="fixed left-0 top-0 z-20 h-min-screen w-64 bg-[#1e293b] text-white flex flex-col relative">
      <div className="p-6 flex items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Portal</h1>
      </div>
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 rounded-lg text-left text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <LogOutIcon className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 relative">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                isActive ? 'text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 bg-blue-600 rounded-lg z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center w-full p-3 rounded-lg text-left text-gray-300 hover:bg-gray-700 transition-colors">
          <Settings className="h-5 w-5 mr-3" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;