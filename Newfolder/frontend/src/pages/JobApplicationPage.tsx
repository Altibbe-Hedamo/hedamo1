import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function JobApplicationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    mobile_number: string;
    resume: File | null;
    education: string;
    experience: string;
    skills: string;
  }>({
    full_name: "",
    email: "",
    mobile_number: "",
    resume: null,
    education: "",
    experience: "",
    skills: "",
  });
  const [formErrors, setFormErrors] = useState<{
    full_name?: string;
    email?: string;
    mobile_number?: string;
    resume?: string;
    education?: string;
    experience?: string;
    skills?: string;
  }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/careers`);
        const foundJob = response.data.jobs.find(
          (j: Job) => j.id === parseInt(jobId || "")
        );
        setJob(foundJob || null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch job");
      }
    };
    fetchJob();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [jobId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.full_name.trim()) errors.full_name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.mobile_number.trim()) {
      errors.mobile_number = "Mobile number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.mobile_number)) {
      errors.mobile_number = "Invalid mobile number format";
    }
    if (!formData.resume) errors.resume = "Resume is required";

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const form = new FormData();
        form.append("job_id", jobId || "");
        form.append("full_name", formData.full_name);
        form.append("email", formData.email);
        form.append("mobile_number", formData.mobile_number);
        if (formData.resume) form.append("resume", formData.resume);
        form.append("education", formData.education);
        form.append("experience", formData.experience);
        form.append("skills", formData.skills.split(",").map(s => s.trim()).join(","));

        await api.post("/api/careers/apply", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFormSubmitted(true);
        document
          .getElementById("application-confirmation")
          ?.scrollIntoView({ behavior: "smooth" });
      } catch (err: any) {
        setFormErrors({
          ...errors,
          resume: err.response?.data?.error || "Failed to submit application",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        setFormErrors((prev) => ({
          ...prev,
          resume: "Only PDF files are allowed",
        }));
      } else if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          resume: "File size should be less than 5MB",
        }));
      } else {
        setFormData((prev) => ({ ...prev, resume: file }));
        setFormErrors((prev) => ({ ...prev, resume: undefined }));
      }
    }
  };

  if (!job && !error) {
    return <div>Loading...</div>;
  }

  if (!job || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full transform transition-all hover:scale-[1.02]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Job not found
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "The job you are looking for does not exist or may have been removed."}
          </p>
          <Link
            to="/careers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-105"
          >
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 scroll-smooth">
      {/* Floating apply button for mobile */}
      <div
        className={`md:hidden fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          to="#apply"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          Apply Now
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Link
          to="/careers"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Careers
        </Link>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Job Header */}
          <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-600 px-6 sm:px-8 py-6 sm:py-8">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.svg')] bg-repeat"></div>
            <div className="relative">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {job.title}
              </h1>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-indigo-200">Your Company</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-600/90 text-white backdrop-blur-sm">
                  {job.department}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/90 text-white backdrop-blur-sm">
                  {job.location}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white backdrop-blur-sm">
                  {job.type}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/90 text-white backdrop-blur-sm">
                  {job.salary}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  Posted: {new Date(job.posted_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Job Details */}
            <div className="md:col-span-2 space-y-6 md:space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Job Description
                </h2>
                <p className="text-gray-700">{job.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 p-4 sm:p-6 rounded">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b">
                    Requirements
                  </h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 sm:p-6 rounded">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b">
                    Benefits
                  </h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {job.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="md:col-span-1" id="apply">
              <div
                className={`bg-white rounded-xl p-4 sm:p-6 ${
                  isMobile ? "" : "sticky top-6"
                } shadow-lg border border-gray-100 transition-all duration-300 ${
                  isScrolled && !isMobile ? "md:-translate-y-2" : ""
                }`}
              >
                {formSubmitted ? (
                  <div
                    id="application-confirmation"
                    className="text-center py-6 sm:py-8"
                  >
                    <div className="mx-auto flex items-center justify-center h-14 sm:h-16 w-14 sm:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
                      <svg
                        className="h-6 sm:h-8 w-6 sm:w-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6">
                      Thank you for applying to {job.title}. We'll review your
                      application and get back to you soon.
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      <Link
                        to="/careers"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-105"
                      >
                        Browse Other Jobs
                      </Link>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-105"
                      >
                        Apply Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                      Apply for this position
                    </h2>
                    <form
                      onSubmit={handleFormSubmit}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div>
                        <label
                          htmlFor="full_name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="full_name"
                          type="text"
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.full_name
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                          placeholder="John Doe"
                        />
                        {formErrors.full_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.full_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.email
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="mobile_number"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="mobile_number"
                          type="text"
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.mobile_number
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.mobile_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mobile_number: e.target.value,
                            })
                          }
                          placeholder="+1234567890"
                        />
                        {formErrors.mobile_number && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.mobile_number}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="resume"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Resume/CV (PDF) <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={`mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6 border-2 border-dashed ${
                            formErrors.resume
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-lg transition-colors shadow-sm hover:border-indigo-300`}
                        >
                          <div className="space-y-1 text-center">
                            <svg
                              className={`mx-auto h-10 sm:h-12 w-10 sm:w-12 ${
                                formData.resume
                                  ? "text-indigo-500"
                                  : "text-gray-400"
                              }`}
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4 4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex flex-col items-center sm:flex-row text-sm text-gray-600">
                              <label
                                htmlFor="resume"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus:ring-indigo-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="resume"
                                  name="resume"
                                  type="file"
                                  accept="application/pdf"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="sm:pl-1 text-center sm:text-left">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF up to 5MB</p>
                            {formData.resume && (
                              <p className="text-sm text-indigo-600 mt-2 flex items-center justify-center">
                                <div className="flex items-center">
                                  <svg
                                    className="inline w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="truncate max-w-[180px] sm:max-w-[220px]">
                                    {formData.resume.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData({ ...formData, resume: null })
                                    }
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                    aria-label="Remove file"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </p>
                            )}
                          </div>
                        </div>
                        {formErrors.resume && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.resume}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="education"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Education
                        </label>
                        <textarea
                          id="education"
                          rows={2}
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.education
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.education}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              education: e.target.value,
                            })
                          }
                          placeholder="Your educational background"
                        />
                        {formErrors.education && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.education}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="experience"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Experience
                        </label>
                        <textarea
                          id="experience"
                          rows={2}
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.experience
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience: e.target.value,
                            })
                          }
                          placeholder="Your work experience"
                        />
                        {formErrors.experience && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.experience}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="skills"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Skills
                        </label>
                        <textarea
                          id="skills"
                          rows={2}
                          className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                            formErrors.skills
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          } focus:ring-2 focus:outline-none transition-colors shadow-sm`}
                          value={formData.skills}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: e.target.value,
                            })
                          }
                          placeholder="Your skills (e.g., JavaScript, Project Management)"
                        />
                        {formErrors.skills && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.skills}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                            </svg>
                            Submit Application
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        By applying, you agree to our{" "}
                        <a
                          href="#"
                          className="text-indigo-600 hover:underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        and consent to our processing your information in
                        accordance with these terms.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}