import React from 'react';
import UserProfileSidebar from './UserProfileSidebar';
import { Outlet, useLocation } from 'react-router-dom';

const getHeading = (pathname: string) => {
  if (pathname.endsWith('/products')) return 'Products';
  if (pathname.endsWith('/products-map')) return 'Map';
  if (pathname.endsWith('/wishlist')) return 'Wishlist';
  if (pathname.endsWith('/directories')) return 'Directories';
  return '';
};

const UserProfile: React.FC = () => {
  const location = useLocation();
  const heading = getHeading(location.pathname);

  return (
    <div className="flex min-h-screen">
      <UserProfileSidebar />
      <main className="flex-1 bg-gray-50 p-8">
        {heading && (
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">{heading}</h1>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default UserProfile; 