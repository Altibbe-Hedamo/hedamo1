import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHeadset, FaBuilding, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const HapSidebar: React.FC = () => {
  const location = useLocation();
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const menuItems = [
    {
      type: 'dropdown',
      label: 'Company',
      icon: <FaBuilding className="w-5 h-5" />,
      isOpen: isCompanyOpen,
      toggle: () => setIsCompanyOpen(!isCompanyOpen),
      subItems: [
        {
          path: '/hap-portal/create-company',
          label: 'Create Company'
        },
        {
          path: '/hap-portal/manage-company',
          label: 'Manage Company'
        }
      ]
    },
    {
      type: 'link',
      path: '/hap-portal/help-line',
      icon: <FaHeadset className="w-5 h-5" />,
      label: 'Help Line'
    }
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">HAP Portal</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.type === 'dropdown' ? (
                  <div>
                    <button
                      onClick={item.toggle}
                      className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg transition-colors hover:bg-gray-50`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </div>
                      {item.isOpen ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {item.isOpen && (
                      <ul className="mt-2 ml-8 space-y-2">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={`block px-4 py-2 text-gray-700 rounded-lg transition-colors ${
                                location.pathname === subItem.path
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  item.path && (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HapSidebar; 