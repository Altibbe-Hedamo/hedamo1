import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaMapMarkedAlt, FaHeart, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const UserProfileSidebar: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder user info
  const user = {
    name: 'User Name',
    initials: 'UN',
    role: 'Client',
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hedamo_user');
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 z-20 h-min-screen w-64 bg-[#1A3C34] text-white p-4 flex flex-col relative transition-all duration-300 ease-in-out overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 p-2 rounded-lg bg-[#2A5C54]">
        <h1 className="text-xl font-bold flex items-center">
          <FaUserCircle className="mr-2 text-blue-300" />
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
            User Portal
          </span>
        </h1>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Active Now"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          <li
            className="p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer"
            onClick={() => navigate('/user-profile/products')}
          >
            <FaBox className="mr-3 text-gray-300" />
            <span className="text-gray-300">Products Page</span>
          </li>
          <li
            className="p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer"
            onClick={() => navigate('/user-profile/products-map')}
          >
            <FaMapMarkedAlt className="mr-3 text-gray-300" />
            <span className="text-gray-300">Products Map</span>
          </li>
          <li
            className="p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer"
            onClick={() => navigate('/user-profile/wishlist')}
          >
            <FaHeart className="mr-3 text-gray-300" />
            <span className="text-gray-300">Wishlist</span>
          </li>
          <li
            className="p-3 hover:bg-[#2A5C54] rounded-lg flex items-center transition-colors cursor-pointer"
            onClick={() => navigate('/user-profile/directories')}
          >
            <FaBox className="mr-3 text-gray-300" />
            <span className="text-gray-300">Directories</span>
          </li>
        </ul>
      </nav>

      {/* Bottom: Logout and User Mini Profile */}
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
        <div className="mt-6 p-3 bg-[#2A5C54] rounded-lg flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center mr-3">
            <span className="text-xs font-bold text-[#1A3C34]">
              {user.initials}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {user.name}
            </p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar; 