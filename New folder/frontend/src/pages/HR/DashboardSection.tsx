import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  posted_date: string;
  status: string;
  application_count: number;
}

interface Activity {
  action: string;
  time: string;
}

const DashboardSection: React.FC = () => {
  useContext(AuthContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, activitiesResponse] = await Promise.all([
          api.get('/api/hr/jobs'),
          api.get('/api/hr/activities')
        ]);
        setJobs(jobsResponse.data.jobs);
        setActivities(activitiesResponse.data.activities);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = jobs.reduce((sum, job) => sum + job.application_count, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">HR Dashboard</h1>
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Jobs</h2>
          <p className="text-2xl">{totalJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Active Jobs</h2>
          <p className="text-2xl">{activeJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Applications</h2>
          <p className="text-2xl">{totalApplications}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <ul className="space-y-2">
          {activities.map((activity, index) => (
            <li key={index} className="text-gray-600">
              {activity.action} - {activity.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSection;