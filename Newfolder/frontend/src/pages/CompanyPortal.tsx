import React, { useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';

const CompanyPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('');
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <CompanySidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Company</h1>
        {/* Main content for the company portal will go here */}
      </div>
    </div>
  );
};

export default CompanyPortal; 