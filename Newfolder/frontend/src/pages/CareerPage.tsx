import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../config/axios";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary: string;
  posted_date: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/api/careers");
        setJobs(response.data.jobs);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch jobs");
      }
    };
    fetchJobs();
  }, []);

  const departments = [...new Set(jobs.map((job) => job.department))];
  const locations = [...new Set(jobs.map((job) => job.location))];
  const jobTypes = [...new Set(jobs.map((job) => job.type))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment
      ? job.department === selectedDepartment
      : true;
    const matchesLocation = selectedLocation
      ? job.location === selectedLocation
      : true;
    const matchesJobType = selectedJobType ? job.type === selectedJobType : true;

    return matchesSearch && matchesDepartment && matchesLocation && matchesJobType;
  });

  const toggleJobExpansion = (id: number) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl md:text-2xl mb-8">
            Help us build the future of technology
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full py-4 px-6 rounded-lg text-gray-800 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-4 top-4 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Department</h3>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Location</h3>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Job Type</h3>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("");
                  setSelectedLocation("");
                  setSelectedJobType("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "Job" : "Jobs"} Available
              </h2>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No jobs found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleJobExpansion(job.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-indigo-700">
                            {job.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              {job.department}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              {job.location}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">{job.salary}</p>
                          <p className="text-sm text-gray-500">
                            Posted:{" "}
                            {new Date(job.posted_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {expandedJobId === job.id && (
                      <div className="px-6 pb-6 border-t border-gray-200">
                        <div className="mt-4">
                          <h4 className="font-medium text-lg mb-2">
                            Job Description
                          </h4>
                          <p className="text-gray-700">{job.description}</p>
                        </div>

                        <div className="mt-6 grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-medium text-lg mb-2">
                              Requirements
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                              {job.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-lg mb-2">
                              Benefits
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                              {job.benefits.map((benefit, i) => (
                                <li key={i}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-8">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't find the right role?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and
            we'll contact you when a matching position opens up.
          </p>
          <button className="bg-white text-gray-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-200 transition">
            Submit Your Resume
          </button>
        </div>
      </div>
    </div>
  );
}