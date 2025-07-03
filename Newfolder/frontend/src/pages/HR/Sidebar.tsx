import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiHome, FiBriefcase, FiFileText, FiLogOut, FiUser } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear user session
    navigate('/login', { replace: true }); // Redirect to login page with replace to prevent going back
  };

  // Define navigation items in an array for better maintainability
  const navItems = [
    { path: "/hr-dashboard/dashboard", label: "Dashboard", icon: <FiHome className="mr-2" /> },
    { path: "/hr-dashboard/jobs", label: "Jobs", icon: <FiBriefcase className="mr-2" /> },
    { path: "/hr-dashboard/applications", label: "Applications", icon: <FiFileText className="mr-2" /> },
  ];

  return (
    <div className="w-64 bg-white shadow-md min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-6 text-blue-600">HR Dashboard</div>
      
      {/* User profile section */}
      <div className="flex items-center mb-6 p-2 rounded-lg bg-gray-50">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <FiUser className="text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-800">{user?.name || 'HR User'}</div>
          <div className="text-sm text-gray-500 truncate">{user?.email}</div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button at the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;