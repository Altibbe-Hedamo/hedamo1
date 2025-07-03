import React, { useState, useEffect } from 'react';

// Mock company profile data (replace with real API call later)
const mockProfile = {
  name: 'Hedamo Pvt Ltd',
  email: 'info@hedamo.com',
  registrationNumber: 'REG-2023-001',
  address: '123 Main Street, Hyderabad, India',
  currentMarket: 'India, Middle East',
  certifications: ['ISO 9001', 'FSSAI', 'Organic', 'Other'],
  established: '2018-05-10',
  ceo: 'John Doe',
  phone: '+91-9876543210',
  website: 'https://hedamo.com',
  compliance: {
    gst: '27AAECS1234F1ZV',
    pan: 'AAECS1234F',
    msme: 'UDYAM-TS-12-0001234',
    codeOfConduct: true,
    criminalRecord: 'No',
    conflictOfInterest: 'None',
  },
  additional: {
    comments: 'Leading agri exporter',
    documents: ['company-profile.pdf', 'gst-certificate.pdf'],
  },
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <span className="mr-2 text-2xl">{icon}</span> {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-medium text-gray-700">{label}: </span>
    <span className="text-gray-900">{value}</span>
  </div>
);

const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile(mockProfile);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
        </svg>
      </div>
    );
  }

  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Company Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Company Header */}
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-white mr-4">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>

        <Section title="Company Details" icon="🏢">
          <Field label="Company Name" value={profile.name} />
          <Field label="Registration Number" value={profile.registrationNumber} />
          <Field label="Established" value={profile.established} />
          <Field label="CEO / Director" value={profile.ceo} />
          <Field label="Phone" value={profile.phone} />
          <Field label="Email" value={profile.email} />
          <Field label="Address" value={profile.address} />
          <Field label="Current Market" value={profile.currentMarket} />
          <Field label="Website" value={<a href={profile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{profile.website}</a>} />
        </Section>

        <Section title="Certifications" icon="📄">
          <Field label="Certifications" value={profile.certifications.join(', ')} />
        </Section>

        <Section title="Compliance & Declarations" icon="📜">
          <Field label="GST Number" value={profile.compliance.gst} />
          <Field label="PAN" value={profile.compliance.pan} />
          <Field label="MSME" value={profile.compliance.msme} />
          <Field label="Code of Conduct Accepted" value={profile.compliance.codeOfConduct ? 'Yes' : 'No'} />
          <Field label="Criminal Record" value={profile.compliance.criminalRecord} />
          <Field label="Conflict of Interest" value={profile.compliance.conflictOfInterest} />
        </Section>

        <Section title="Additional Information" icon="ℹ️">
          <Field label="Comments" value={profile.additional.comments} />
          <Field label="Documents" value={profile.additional.documents.map((doc: string, i: number) => (
            <a key={i} href={`#`} className="text-blue-600 hover:underline mr-2">{doc}</a>
          ))} />
        </Section>
      </div>
    </div>
  );
};

export default CompanyProfilePage; 