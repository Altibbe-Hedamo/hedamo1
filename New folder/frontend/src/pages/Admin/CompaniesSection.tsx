import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { Building2 } from 'lucide-react';

interface Company {
  company_id: number;
  company_name: string;
  company_status: string;
  created_at: string;
  agent: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const CompaniesSection: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/profiles');
      // Transform the data to match the companies format
      const companiesData = response.data.profiles.flatMap((profile: any) => 
        profile.companies.map((company: any) => ({
          company_id: company.company_id,
          company_name: company.company_name,
          company_status: company.company_status,
          created_at: company.created_at,
          agent: {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email
          }
        }))
      );
      setCompanies(companiesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApproveCompany = async (companyId: number) => {
    try {
      await api.post(`/api/companies/${companyId}/approve`);
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      console.error('Error approving company:', err);
      setError('Failed to approve company. Please try again.');
    }
  };

  const handleReviewCompany = async (companyId: number) => {
    try {
      await api.post(`/api/companies/${companyId}/review`);
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      console.error('Error reviewing company:', err);
      setError('Failed to review company. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      under_review: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
        <button
          onClick={fetchCompanies}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <Building2 className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Companies</h3>
        </div>
        <div className="space-y-4">
          {companies.map((company) => (
            <div
              key={company.company_id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{company.company_name}</p>
                  <p className="text-sm text-gray-500">
                    Agent: {company.agent.first_name} {company.agent.last_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(company.company_status)}
              </div>
              {company.company_status === 'pending' && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleApproveCompany(company.company_id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewCompany(company.company_id)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}
          {companies.length === 0 && (
            <p className="text-gray-500">No companies found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompaniesSection; 