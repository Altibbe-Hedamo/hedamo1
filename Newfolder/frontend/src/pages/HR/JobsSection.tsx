import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  posted_date: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: string;
  application_count: number;
}

const JobsSection: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [] as string[],
    benefits: [] as string[],
    status: 'active',
    csrf_token: '',
  });
  const navigate = useNavigate();

  const fetchCsrfToken = async (retries = 3): Promise<boolean> => {
    try {
      const { data } = await api.get('/api/csrf-token');
      setCsrfToken(data.csrfToken);
      setFormData(prev => ({ ...prev, csrf_token: data.csrfToken }));
      return true;
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`Retrying CSRF token fetch, ${retries} attempts left`);
        return fetchCsrfToken(retries - 1);
      }
      setError(err.response?.data?.error || 'Failed to fetch CSRF token. Please try logging in again.');
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const csrfSuccess = await fetchCsrfToken();
      if (csrfSuccess) {
        fetchJobs();
      }
    };
    initialize();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/api/hr/jobs');
      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'requirements' || name === 'benefits' ? value.split(',').map(item => item.trim()) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('CSRF token is missing. Please refresh the page.');
      return;
    }
    try {
      const config = {
        headers: {
          'x-csrf-token': csrfToken,
        },
      };
      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        status: formData.status,
      };
      if (editingJob) {
        await api.put(`/api/hr/jobs/${editingJob.id}`, payload, config);
      } else {
        await api.post('/api/hr/jobs', payload, config);
      }
      fetchJobs();
      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: [],
        benefits: [],
        status: 'active',
        csrf_token: csrfToken,
      });
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: Please ensure you are logged in as HR/admin and try again.');
        // Attempt to refresh CSRF token
        const csrfSuccess = await fetchCsrfToken();
        if (!csrfSuccess) {
          setError('Failed to refresh CSRF token. Please log out and log in again.');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to save job');
      }
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      status: job.status,
      csrf_token: csrfToken || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    if (!csrfToken) {
      setError('CSRF token is missing. Please refresh the page.');
      return;
    }
    try {
      const config = {
        headers: {
          'x-csrf-token': csrfToken,
        },
      };
      await api.delete(`/api/hr/jobs/${id}`, config);
      fetchJobs();
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: Please ensure you are logged in as HR/admin.');
      } else {
        setError(err.response?.data?.error || 'Failed to delete job');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Jobs Management</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          Post New Job
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
          <div>
            <label className="block">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block">Salary</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Requirements (comma-separated)</label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements.join(',')}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Benefits (comma-separated)</label>
            <input
              type="text"
              name="benefits"
              value={formData.benefits.join(',')}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {editingJob ? 'Update Job' : 'Post Job'}
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setShowForm(false);
                setEditingJob(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Job Listings</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Salary</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Applications</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b">
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.department}</td>
                <td className="p-2">{job.location}</td>
                <td className="p-2">{job.type}</td>
                <td className="p-2">{job.salary}</td>
                <td className="p-2">{job.status}</td>
                <td className="p-2">
                  <button
                    className="text-blue-500"
                    onClick={() => navigate(`/api/hr-dashboard/applications?jobId=${job.id}`)}
                  >
                    {job.application_count}
                  </button>
                </td>
                <td className="p-2">
                  <button
                    className="text-blue-500 mr-2"
                    onClick={() => handleEdit(job)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobsSection;