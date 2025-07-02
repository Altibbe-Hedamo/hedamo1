import React, { useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import {
  FaUser, FaDatabase, FaBox, FaBook, FaCalculator, FaWallet, FaBell, FaHeadset, FaGavel, FaFileInvoiceDollar, FaComments, FaUsers
} from 'react-icons/fa';

const companySidebarItems = [
  { section: 'profile', path: '/company-portal/profile', icon: FaUser, label: 'Profile' },
  { section: 'horizon-data', path: '/company-portal/horizon-data', icon: FaDatabase, label: 'Horizon Data' },
  { section: 'product-page', path: '/company-portal/product-page', icon: FaBox, label: 'Product page' },
  { section: 'ledger', path: '/company-portal/ledger', icon: FaBook, label: 'Ledger' },
  { section: 'price-calculator', path: '/company-portal/price-calculator', icon: FaCalculator, label: 'Price Calculator' },
  { section: 'payments', path: '/company-portal/payments', icon: FaWallet, label: 'Payments' },
  { section: 'renewal-reminders', path: '/company-portal/renewal-reminders', icon: FaBell, label: 'Renewal remainders' },
  { section: 'help-line', path: '/company-portal/help-line', icon: FaHeadset, label: 'Help Line' },
  { section: 'legal-resources', path: '/company-portal/legal-resources', icon: FaGavel, label: 'Legal Resources' },
  { section: 'invoicing', path: '/company-portal/invoicing', icon: FaFileInvoiceDollar, label: 'Invoicing' },
  { section: 'communication-center', path: '/company-portal/communication-center', icon: FaComments, label: 'Communication Center' },
  { section: 'customer-care', path: '/company-portal/customer-care', icon: FaUsers, label: 'Customer Care' },
];

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