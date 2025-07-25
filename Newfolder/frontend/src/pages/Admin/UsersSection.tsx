import React, { useState, useEffect } from 'react';
import { User, Building, Package } from 'lucide-react';
import api from '../../config/axios';  // Import the configured axios instance

interface Company {
  company_id: number;
  company_name: string;
  company_status: string;
  products: Product[];
  created_at: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_status: string;
  report_status: string;
}

interface Agent {
  id: number;
  user_id: number;
  full_name: string;
  email_address: string;
  status: string;
  email: string;
  first_name: string;
  last_name: string;
  companies: Company[];
  created_at: string;
  updated_at: string;
  hasProfile: boolean;
  profile?: any;
  years_of_experience?: string;
  linkedin_url?: string;
}

const UsersSection: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication error');
          setLoading(false);
          return;
        }
        console.log('Fetching agents...');
        
        const response = await api.get('/api/admin/profiles');
        console.log('Raw API response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.profiles)) {
          // Filter for agent profiles only
          const agentProfiles = response.data.profiles.filter((profile: any) => profile.signup_type === 'agent');
          
          // Log each profile's data structure
          agentProfiles.forEach((profile: any, index: number) => {
            console.log(`Profile ${index}:`, {
              id: profile.id,
              profile_id: profile.profile_id,
              user_id: profile.user_id,
              status: profile.status,
              full_name: profile.full_name
            });
          });

          // Process the profiles to ensure we have the correct ID
          const processedAgents = agentProfiles.map((agent: any) => {
            // Use user_id if profile_id is not available
            const id = agent.profile_id || agent.user_id;
            console.log(`Processing agent ${agent.full_name}:`, {
              original: agent,
              usingId: id,
              hasProfile: !!agent.profile_id
            });
            
            return {
              ...agent,
              id: id, // Use user_id as fallback
              status: agent.status || 'pending',
              hasProfile: !!agent.profile_id
            };
          });

          console.log('All processed agents:', processedAgents);
          setAgents(processedAgents);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError('Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleVerify = async (agentId: number, status: 'active' | 'rejected', rejectionReason?: string) => {
    console.log('Attempting to approve/reject agent:', { agentId, status, rejectionReason });
    console.log('Current token:', sessionStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('Current agents state:', agents);

    try {
      const response = await api.post(`/api/admin/users/${agentId}/approve`, {
        status,
        rejectionReason
      });

      console.log('Approval response:', response.data);

      if (response.data.success) {
        // Update the local state
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === agentId 
              ? { 
                  ...agent, 
                  status: status,
                  profile: response.data.profile || agent.profile
                }
              : agent
          )
        );

        // Show success message
        alert(`Agent ${status} successfully${response.data.profile ? ' and profile created' : ''}`);
        
      } else {
        throw new Error(response.data.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating agent status:', error);
      alert(error.response?.data?.error || 'Failed to update agent status');
    }
  };

  const handleApproveCompany = async (companyId: number, agentId: number) => {
    try {
      const response = await api.post(
        `/api/companies/${companyId}/approve`,
        {}
      );
      if (response.data.success) {
        setAgents(agents.map(agent => {
          if (agent.id === agentId) {
            return {
              ...agent,
              companies: agent.companies.map(company =>
                company.company_id === companyId 
                  ? { ...company, company_status: 'active' }
                  : company
              ),
            };
          }
          return agent;
        }));
      }
    } catch (error) {
      console.error('Error approving company:', error);
      setError('Failed to approve company');
    }
  };

  const handleReviewCompany = async (companyId: number, agentId: number) => {
    try {
      const response = await api.post(
        `/api/companies/${companyId}/review`,
        {}
      );
      if (response.data.success) {
        setAgents(agents.map(agent => {
          if (agent.id === agentId) {
            return {
              ...agent,
              companies: agent.companies.map(company =>
                company.company_id === companyId 
                  ? { ...company, company_status: 'under_review' }
                  : company
              ),
            };
          }
          return agent;
        }));
      }
    } catch (error) {
      console.error('Error reviewing company:', error);
      setError('Failed to review company');
    }
  };

  const handleVerifyProduct = async (productId: number, agentId: number) => {
    try {
      const response = await api.post(
        `/api/products/${productId}/verify`,
        {}
      );
      if (response.data.success) {
        setAgents(agents.map(agent => {
          if (agent.id === agentId) {
            return {
              ...agent,
              companies: agent.companies.map(company => ({
                ...company,
                products: company.products.map(product =>
                  product.product_id === productId 
                    ? { ...product, product_status: 'active' }
                    : product
                ),
              })),
            };
          }
          return agent;
        }));
      }
    } catch (error) {
      console.error('Error verifying product:', error);
      setError('Failed to verify product');
    }
  };

  const handleRequestProductInfo = async (productId: number, agentId: number) => {
    try {
      const response = await api.post(
        `/api/products/${productId}/request-info`,
        {}
      );
      if (response.data.success) {
        setAgents(agents.map(agent => {
          if (agent.id === agentId) {
            return {
              ...agent,
              companies: agent.companies.map(company => ({
                ...company,
                products: company.products.map(product =>
                  product.product_id === productId 
                    ? { ...product, product_status: 'info_requested' }
                    : product
                ),
              })),
            };
          }
          return agent;
        }));
      }
    } catch (error) {
      console.error('Error requesting product info:', error);
      setError('Failed to request product info');
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Agents</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Agent Management</h2>
      </div>
      {/* Responsive grid for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Agents Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex flex-wrap items-center mb-4">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Agents</h3>
          </div>
          <div className="space-y-4">
            {agents.map(agent => {
              const showButtons = agent.status === 'pending';
              return (
                <div key={agent.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium break-words">{agent.full_name}</p>
                      <p className="text-sm text-gray-500 break-words">{agent.email_address}</p>
                      <p className="text-xs text-gray-400">Attached: {new Date(agent.created_at).toLocaleDateString()}</p>
                      {/* Company Names */}
                      <p className="text-xs text-gray-400">Company: {agent.companies.length > 0 ? agent.companies.map(c => c.company_name).join(', ') : 'N/A'}</p>
                      <p className="text-xs text-gray-400">LinkedIn: {agent.linkedin_url ? (
                        <a href={agent.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Profile</a>
                      ) : ('Not Available')}</p>
                      <p className="text-xs text-gray-400">{agent.hasProfile ? 'Emp ID' : 'Emp ID'}: {agent.id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : agent.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>{agent.status}</span>
                  </div>
                  {showButtons && (
                    <div className="flex flex-wrap space-x-2 mt-3">
                      <button
                        onClick={() => handleVerify(agent.id, 'active')}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(agent.id, 'rejected')}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {agents.length === 0 && (
              <p className="text-gray-500">No agents found.</p>
            )}
          </div>
        </div>
        {/* Companies Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex flex-wrap items-center mb-4">
            <Building className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Companies</h3>
          </div>
          <div className="space-y-4">
            {agents.map(agent =>
              agent.companies.map(company => (
                <div key={company.company_id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium break-words">{company.company_name}</p>
                      <p className="text-sm text-gray-500 break-words">Agent: {agent.full_name}</p>
                      <p className="text-xs text-gray-400">Created: {new Date(company.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      company.company_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : company.company_status === 'under_review'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>{company.company_status}</span>
                  </div>
                  {company.company_status === 'pending' && (
                    <div className="flex flex-wrap space-x-2 mt-2">
                      <button
                        onClick={() => handleApproveCompany(company.company_id, agent.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewCompany(company.company_id, agent.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
            {agents.every(agent => agent.companies.length === 0) && (
              <p className="text-gray-500">No companies found.</p>
            )}
          </div>
        </div>
        {/* Products Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex flex-wrap items-center mb-4">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Products</h3>
          </div>
          <div className="space-y-4">
            {agents.map(agent =>
              agent.companies.map(company =>
                company.products.map(product => (
                  <div key={product.product_id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-medium break-words">{product.product_name}</p>
                        <p className="text-sm text-gray-500 break-words">Company: {company.company_name}</p>
                        <p className="text-xs text-gray-400">Agent: {agent.full_name}</p>
                      </div>
                      <div className="flex flex-col items-end min-w-0">
                        <span className={`px-2 py-1 text-xs rounded-full mb-1 ${
                          product.product_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.product_status === 'info_requested'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>{product.product_status}</span>
                        {product.report_status && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.report_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>{product.report_status}</span>
                        )}
                      </div>
                    </div>
                    {product.product_status === 'pending' && (
                      <div className="flex flex-wrap space-x-2 mt-2">
                        <button
                          onClick={() => handleRequestProductInfo(product.product_id, agent.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Request Info
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
            {agents.every(agent => agent.companies.every(company => company.products.length === 0)) && (
              <p className="text-gray-500">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSection;