import React from 'react';

const LegalDocumentPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Legal Document</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Terms of Service</h2>
          <div className="space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">User Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate registration information</li>
                <li>Maintain account security</li>
                <li>Comply with platform policies</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Admin Privileges</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full system access and management</li>
                <li>User data and HVP management</li>
                <li>Platform monitoring and auditing</li>
                <li>Support and dispute resolution</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Privacy & Security</h2>
          <div className="space-y-6 text-gray-600">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Data Protection</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption</li>
                <li>Restricted data access</li>
                <li>Regular security audits</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Compliance</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>ISO 27001 certified</li>
                <li>GDPR compliant</li>
                <li>Regular compliance audits</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LegalDocumentPage; 