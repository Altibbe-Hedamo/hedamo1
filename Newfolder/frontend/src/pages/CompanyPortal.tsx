import React from 'react';
import CompanySidebar from '../components/CompanySidebar';

const CompanyPortal: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <CompanySidebar />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1 className="text-3xl font-bold mb-6">Company</h1>
        {/* Main content for the company portal will go here */}
      </div>
    </div>
  );
};

export default CompanyPortal; 