import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LinkGenerator from '../../pages/ChannelPartner/LinkGenerator';
import Referrals from '../../pages/ChannelPartner/Referrals';

const ChannelPartnerDashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="link-generator" element={<LinkGenerator />} />
      <Route path="referrals" element={<Referrals />} />
      <Route path="/" element={<Navigate to="referrals" replace />} />
    </Routes>
  );
};

export default ChannelPartnerDashboardRoutes; 