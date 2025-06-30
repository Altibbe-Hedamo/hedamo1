import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../config/axios';

interface Application {
  id: number;
  job_id: number;
  user_id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  resume_path: string;
  education: any;
  experience: any;
  skills: string[];
  status: string;
  created_at: string;
}

const ApplicationsSection: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const jobId = query.get('jobId');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const { data } = await api.get('/api/csrf-token');
        setCsrfToken(data.csrfToken);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch CSRF token');
      }
    };
    fetchCsrfToken();
    if (jobId) {
      fetchApplications(jobId);
    }
  }, [jobId]);

  const fetchApplications = async (jobId: string) => {
    try {
      const { data } = await api.get(`/api/hr/jobs/${jobId}/applications`);
      setApplications(data.applications);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch applications');
    }
  };

  const updateStatus = async (applicationId: number, status: string) => {
    try {
      const config = {
        headers: {
          'x-csrf-token': csrfToken,
        },
      };
      await api.post(`/api/hr/applications/${applicationId}/status`, { status, csrf_token: csrfToken }, config);
      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? { ...app, status } : app))
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Applications Management</h1>
      {error && <div className="text-red-500">{error}</div>}
      {!jobId && <div className="text-gray-600">Please select a job to view applications.</div>}
      {jobId && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Applications for Job ID: {jobId}</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Mobile</th>
                <th className="p-2 text-left">Skills</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className="border-b">
                  <td className="p-2">{app.full_name}</td>
                  <td className="p-2">{app.email}</td>
                  <td className="p-2">{app.mobile_number}</td>
                  <td className="p-2">{app.skills.join(', ')}</td>
                  <td className="p-2">{app.status}</td>
                  <td className="p-2">
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <a
                      href={`https://backend-n3hc.onrender.com/Uploads/profiles/${app.resume_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 ml-2"
                    >
                      View Resume
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsSection;