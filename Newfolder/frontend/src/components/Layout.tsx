import { Outlet, NavLink } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Agent Portal</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <NavLink
                to="/agent-dashboard"
                className={({ isActive }) =>
                  isActive ? 'block p-2 bg-blue-500 rounded' : 'block p-2 hover:bg-gray-700 rounded'
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/agent-profile"
                className={({ isActive }) =>
                  isActive ? 'block p-2 bg-blue-500 rounded' : 'block p-2 hover:bg-gray-700 rounded'
                }
              >
                Profile
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/agent/companies"
                className={({ isActive }) =>
                  isActive ? 'block p-2 bg-blue-500 rounded' : 'block p-2 hover:bg-gray-700 rounded'
                }
              >
                Companies
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/agent/products"
                className={({ isActive }) =>
                  isActive ? 'block p-2 bg-blue-500 rounded' : 'block p-2 hover:bg-gray-700 rounded'
                }
              >
                Products
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/agent/payments"
                className={({ isActive }) =>
                  isActive ? 'block p-2 bg-blue-500 rounded' : 'block p-2 hover:bg-gray-700 rounded'
                }
              >
                Payments
              </NavLink>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('hedamo_user');
                  window.location.href = '/Login';
                }}
                className="block p-2 w-full text-left hover:bg-gray-700 rounded"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;