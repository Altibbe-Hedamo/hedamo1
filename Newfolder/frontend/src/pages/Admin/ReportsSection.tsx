import React, { useState, useEffect, type JSX } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import  { AxiosError } from 'axios';
import api from '../../config/axios';

interface Report {
  id: number;
  title: string;
  status: string;
  submitted_by: string;
  date: string;
  reason?: string;
}

type Status = 'Pending' | 'Approved' | 'Rejected';

const statusIcons: Record<Status, JSX.Element> = {
  Pending: <Clock className="h-4 w-4 text-yellow-500" />,
  Approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  Rejected: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const ReportsSection: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const statuses: Status[] = ['Pending', 'Approved', 'Rejected'];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/api/reports');
        setReports(response.data);
        setLoading(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Failed to fetch reports:', axiosError.message);
        if (axiosError.response?.status === 401) {
          alert('Please log in to access this section.');
        }
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleApproveReport = async (id: number) => {
    try {
      await api.post(`/api/reports/${id}/approve`, {});
      setReports(reports.map(report =>
        report.id === id ? { ...report, status: 'approved' } : report
      ));
    } catch (error) {
      console.error('Failed to approve report:', (error as AxiosError).message);
    }
  };

  const handleRejectReport = async (id: number) => {
    try {
      await api.post(`/api/reports/${id}/reject`, {});
      setReports(reports.map(report =>
        report.id === id ? { ...report, status: 'rejected' } : report
      ));
    } catch (error) {
      console.error('Failed to reject report:', (error as AxiosError).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Report Management</h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          {statuses.map(status => {
            const reportsInStatus = reports.filter(report => report.status.toLowerCase() === status.toLowerCase());
            if (reportsInStatus.length === 0) return null;

            return (
              <div key={status} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  {statusIcons[status]}
                  <h3 className="text-lg font-semibold ml-2">
                    {status} Reports ({reportsInStatus.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        {status === 'Rejected' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportsInStatus.map(report => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.submitted_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.date}
                          </td>
                          {status === 'Rejected' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {report.reason}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">View</button>
                              {status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveReport(report.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectReport(report.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {status === 'Rejected' && (
                                <button className="text-gray-600 hover:text-gray-900">Resubmit</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
