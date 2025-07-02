import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import CompanySidebar from '../components/CompanySidebar';
import CompanyProfilePage from './CompanyProfilePage';
import CompanyHorizonDataPage from './CompanyHorizonDataPage';
import CompanyProductPage from './CompanyProductPage';
import CompanyLedgerPage from './CompanyLedgerPage';
import CompanyPriceCalculatorPage from './CompanyPriceCalculatorPage';
import CompanyPaymentsPage from './CompanyPaymentsPage';
import CompanyRenewalRemindersPage from './CompanyRenewalRemindersPage';
import CompanyHelpLinePage from './CompanyHelpLinePage';
import CompanyLegalResourcesPage from './CompanyLegalResourcesPage';
import CompanyInvoicingPage from './CompanyInvoicingPage';
import CompanyCommunicationCenterPage from './CompanyCommunicationCenterPage';
import CompanyCustomerCarePage from './CompanyCustomerCarePage';
import CompanyOrdersPage from './CompanyOrdersPage';
import CompanyClientInvoicingPage from './CompanyClientInvoicingPage';
import CompanyHvpLedgerPage from './CompanyHvpLedgerPage';

const CompanyPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('');
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <CompanySidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="profile" element={<CompanyProfilePage />} />
          <Route path="horizon-data" element={<CompanyHorizonDataPage />} />
          <Route path="product-page" element={<CompanyProductPage />} />
          <Route path="ledger" element={<CompanyLedgerPage />} />
          <Route path="price-calculator" element={<CompanyPriceCalculatorPage />} />
          <Route path="payments" element={<CompanyPaymentsPage />} />
          <Route path="renewal-reminders" element={<CompanyRenewalRemindersPage />} />
          <Route path="help-line" element={<CompanyHelpLinePage />} />
          <Route path="legal-resources" element={<CompanyLegalResourcesPage />} />
          <Route path="invoicing" element={<CompanyInvoicingPage />} />
          <Route path="communication-center" element={<CompanyCommunicationCenterPage />} />
          <Route path="customer-care" element={<CompanyCustomerCarePage />} />
          <Route path="orders" element={<CompanyOrdersPage />} />
          <Route path="client-invoicing" element={<CompanyClientInvoicingPage />} />
          <Route path="hvp-ledger" element={<CompanyHvpLedgerPage />} />
          <Route path="*" element={<div className="text-2xl font-bold">Welcome to the Company Portal</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default CompanyPortal; 