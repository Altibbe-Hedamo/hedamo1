import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Building2, Package, ShieldCheck, UserCheck, AlertCircle, ArrowRight, BarChart2, FileText, ClipboardCheck, Clock, PlayCircle, Leaf, Globe, Award, Users } from 'lucide-react';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Process: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const handleKycClick = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setStatusMessage('Please log in to continue');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Verify token response:', response.data);
      
      if (response.data.success && response.data.user) {
        console.log('User data:', response.data.user);
        if (response.data.user.status === 'active') {
          // Store user data in localStorage to maintain session
          localStorage.setItem('user', JSON.stringify(response.data.user));
          // Navigate to agent portal
          navigate('/agent-dashboard');
        } else {
          setStatusMessage('Your account is not yet approved. Please wait for admin approval.');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
        }
      } else {
        setStatusMessage('Failed to verify your account status');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      console.error('Error response:', error.response);
      setStatusMessage('Error checking verification status');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  const steps = [
    {
      title: "Agent Login",
      description: "Access the reporting dashboard by logging in as an agent. This gives you access to view and manage product verification reports.",
      icon: UserCheck,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accent: "blue",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      imageAlt: "Agent login interface illustration",
      features: ["Secure dashboard access", "Role-based permissions", "Report generation rights"]
    },
    {
      title: "Company Creation",
      description: "Create your company profile to start the verification process. This profile will be used to track all product verification reports.",
      icon: Building2,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accent: "green",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      imageAlt: "Company profile creation illustration",
      features: ["Company profile setup", "Document verification", "Report management access"]
    },
    {
      title: "Admin Verification",
      description: "Our admin team will verify your company details and grant access to the reporting system. This process typically takes 24-48 hours.",
      icon: ShieldCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accent: "purple",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      imageAlt: "Admin verification process illustration",
      features: ["Access verification", "Report permissions", "System access approval"]
    },
    {
      title: "Add Products",
      description: "Once verified, you can add products to generate verification reports. Each product will have its own detailed verification status.",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accent: "orange",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      imageAlt: "Product management interface illustration",
      features: ["Product registration", "Report generation", "Status tracking"]
    },
    {
      title: "Product Verification",
      description: "Each product undergoes verification, and detailed reports are generated. Track verification status and download reports for each product.",
      icon: CheckCircle2,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accent: "red",
      image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      imageAlt: "Product verification process illustration",
      features: ["Verification reports", "Status updates", "Document downloads"]
    }
  ];

  const getAccentColor = (accent: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      red: "text-red-600"
    };
    return colors[accent as keyof typeof colors];
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <div className="min-h-[90vh] bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <header className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Welcome to Your Agent Dashboard
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-green-50">
                Follow these steps to complete your onboarding process and start managing products
              </p>
            </motion.div>
          </div>

          {/* Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-16 text-white" viewBox="0 0 1440 120" fill="currentColor" preserveAspectRatio="none">
              <path d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" opacity="0.8"></path>
              <path d="M0,48L48,53.3C96,59,192,69,288,69.3C384,69,480,59,576,53.3C672,48,768,48,864,53.3C960,59,1056,69,1152,74.7C1248,80,1344,80,1392,80L1440,80L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" opacity="0.4"></path>
            </svg>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* YouTube Video Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <PlayCircle className="w-7 h-7 text-green-500 mr-3" />
                  Welcome Video
                </h2>
                <p className="mt-2 text-gray-600">Watch this video to learn more about our platform and how to get started</p>
              </div>
              <div className="p-8">
                <div className="relative w-full max-w-4xl mx-auto">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      className="w-full h-[500px] rounded-2xl shadow-lg"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Welcome to Our Platform"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About Hedomo Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Leaf className="w-7 h-7 text-green-500 mr-3" />
                  About Hedomo
                </h2>
                <p className="mt-2 text-gray-600">Learn more about our platform and service partners</p>
              </div>
              <div className="p-8 space-y-8">
                {/* What is Hedomo */}
                <motion.div 
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300"
                  {...fadeInUp}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-4">What is Hedomo?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Hedomo is an exclusive platform designed to empower organic farmers by ensuring transparency, authenticity, and global reach. Every product listed on our platform carries a Hedomo QR Report, providing unparalleled trust to buyers and businesses worldwide.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Service Partners */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300"
                  {...fadeInUp}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800 mb-4">Hedomo Service Partners</h3>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Our service partners are trusted organizations and individuals who work closely with us to ensure the highest standards of quality and verification. They play a crucial role in:
                      </p>
                      <ul className="space-y-4">
                        {[
                          "Verifying product authenticity and quality standards",
                          "Conducting thorough inspections and audits",
                          "Ensuring compliance with international standards",
                          "Providing expert guidance and support to farmers"
                        ].map((item, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Benefits */}
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300"
                  {...fadeInUp}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-purple-800 mb-6">Benefits of Partnering with Hedomo</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="font-medium text-purple-700 text-lg">For Farmers</h4>
                          <ul className="space-y-3">
                            {[
                              "Global market access",
                              "Premium pricing for verified products",
                              "Technical support and training"
                            ].map((item, index) => (
                              <motion.li 
                                key={index}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium text-purple-700 text-lg">For Buyers</h4>
                          <ul className="space-y-3">
                            {[
                              "Guaranteed product authenticity",
                              "Transparent supply chain",
                              "Quality assurance"
                            ].map((item, index) => (
                              <motion.li 
                                key={index}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Process Steps */}
            <motion.div 
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-sm font-medium mr-3">Onboarding Process</span>
                    Complete These Steps
                  </h2>
                  <p className="mt-2 text-gray-600">Follow these steps to complete your onboarding and start managing products</p>
                </div>
                <div className="p-8 space-y-12">
                  {steps.map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="relative"
                      variants={fadeInUp}
                    >
                      {/* Step Card */}
                      <div className={`relative rounded-2xl border-2 ${step.borderColor} ${step.bgColor} overflow-hidden transform hover:scale-[1.02] transition-transform duration-300`}>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Image Section */}
                          <div className="relative h-48 md:h-full">
                            <img 
                              src={step.image} 
                              alt={step.imageAlt}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:from-black/40" />
                            <div className="absolute top-4 left-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                                {React.createElement(step.icon, { 
                                  className: `w-6 h-6 ${getAccentColor(step.accent)}` 
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bgColor}`}>
                                  {React.createElement(step.icon, { 
                                    className: `w-6 h-6 ${getAccentColor(step.accent)}` 
                                  })}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                                <p className="text-gray-600 mb-4">{step.description}</p>
                                {step.features && (
                                  <ul className="space-y-2">
                                    {step.features.map((feature, index) => (
                                      <motion.li 
                                        key={index} 
                                        className="flex items-start space-x-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">{feature}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrow Connector */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg">
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl p-8"
                variants={fadeInUp}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 text-blue-500 mr-2" />
                  Important Notes
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {[
                      { icon: <FileText className="w-5 h-5 text-blue-500" />, text: "Complete your profile information accurately" },
                      { icon: <BarChart2 className="w-5 h-5 text-blue-500" />, text: "Track your verification status in real-time" }
                    ].map((note, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-4 p-4 rounded-xl bg-blue-50 transform hover:scale-[1.02] transition-transform duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {note.icon}
                        </div>
                        <p className="text-gray-700">{note.text}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: <ClipboardCheck className="w-5 h-5 text-blue-500" />, text: "Upload all required documents for verification" },
                      { icon: <Clock className="w-5 h-5 text-blue-500" />, text: "Verification typically takes 24-48 hours" }
                    ].map((note, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-4 p-4 rounded-xl bg-blue-50 transform hover:scale-[1.02] transition-transform duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {note.icon}
                        </div>
                        <p className="text-gray-700">{note.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* KYC Button Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl p-8 mt-8"
              variants={fadeInUp}
            >
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleKycClick}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium text-lg flex items-center transform hover:scale-105"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </button>
                {showMessage && (
                  <motion.div 
                    className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {statusMessage}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Process; 