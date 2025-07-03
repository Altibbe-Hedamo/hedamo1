import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { TestimonialCarousel } from '../components/testimonial';
import { motion } from 'framer-motion';
import {
  FaRocket,
  FaLock,
  FaChartLine,
  FaComments,
  FaClock,
  FaGlobe,
  FaFileAlt,
  FaUserTie,
  FaBuilding,
  FaDollarSign,
  FaLightbulb,
  FaHandshake,
  FaBolt,
} from 'react-icons/fa';

const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };


  // State for counting animation
  const [counts, setCounts] = useState({
    projects: 0,
    freelancers: 0,
    companies: 0,
    earned: 0,
  });

  // Stats data with target values
  const statsData = [
    { icon: <FaFileAlt />, value: counts.projects, label: 'Projects', target: 6000 },
    { icon: <FaUserTie />, value: counts.freelancers, label: 'Freelancers', target: 200 },
    { icon: <FaBuilding />, value: counts.companies, label: 'Companies', target: 30 },
    { icon: <FaDollarSign />, value: counts.earned, label: 'Earned', target: 100 },
  ];

  // Counting animation effect
  useEffect(() => {
    const duration = 2000; // Animation duration in ms
    const startTime = Date.now();

    const animateCounts = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounts({
        projects: Math.floor(progress * 6000),
        freelancers: Math.floor(progress * 200),
        companies: Math.floor(progress * 30),
        earned: Math.floor(progress * 100),
      });

      if (progress < 1) {
        requestAnimationFrame(animateCounts);
      }
    };

    // Start animation when component mounts
    const animationFrame = requestAnimationFrame(animateCounts);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Feature animation variants
  const featureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const featureItemVariants = {
    hidden: { 
      y: 30,
      opacity: 0,
      rotateX: -90,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "backOut",
      },
    },
    hover: {
      y: -10,
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Header */}
      <motion.div
        className="relative py-20 sm:py-28 mb-8 sm:mb-12 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            About <span className="text-green-500">Hedamo</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Where talent meets opportunity in the modern work landscape
          </motion.p>
        </div>
      </motion.div>

      {/* About Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-100 text-green-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-green-200">
                <FaLightbulb className="mr-2" /> Our Vision
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight text-gray-800">
                Building a better <span className="text-green-500">freelance</span> ecosystem
              </h1>
              <p className="mb-4 sm:mb-6 text-gray-600 leading-relaxed text-sm sm:text-base">
                Hedamo is more than just a platform—it's a community where professionals and businesses come together to create amazing things. We're redefining what it means to work independently in today's digital world.
              </p>
              <p className="mb-6 sm:mb-8 text-gray-600 leading-relaxed text-sm sm:text-base">
                Our smart matching algorithm connects you with the perfect collaborators, while our secure payment system and project tools make the entire process seamless from start to finish.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center bg-gradient-to-r from-green-400 to-green-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg font-medium shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
              >
                <FaBolt className="mr-2" /> Explore Features
              </motion.button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <img
                  className="w-full h-auto object-cover"
                  src="us2.jpg"
                  alt="Team collaboration"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-5 -right-4 sm:-right-5 bg-white p-4 sm:p-5 rounded-lg shadow-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 text-green-600 text-lg sm:text-xl flex items-center justify-center mr-3 sm:mr-4">
                    <FaRocket />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Fast Growth</h4>
                    <p className="text-xs sm:text-sm text-gray-600">200+ new users weekly</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-100 text-green-600 text-xs sm:text-sm font-medium mb-4 border border-green-200">
              <FaHandshake className="mr-2" /> Why Choose Us
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Designed for <span className="text-green-500">modern</span> work
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Tools and features that adapt to how you want to work today
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={featureContainerVariants}
          >
            {[
              {
                icon: <FaBolt className="text-lg sm:text-xl" />,
                title: 'Quick Matching',
                desc: 'Our AI connects you with ideal partners in minutes based on skills, rates, and availability.',
                color: 'from-purple-100 to-purple-50',
              },
              {
                icon: <FaLock className="text-lg sm:text-xl" />,
                title: 'Secure Payments',
                desc: 'Escrow protection ensures everyone gets what they agreed to, with no surprises.',
                color: 'from-blue-100 to-blue-50',
              },
              {
                icon: <FaChartLine className="text-lg sm:text-xl" />,
                title: 'Growth Tools',
                desc: 'Skill assessments and portfolio builders to help you showcase your best work.',
                color: 'from-green-100 to-green-50',
              },
              {
                icon: <FaComments className="text-lg sm:text-xl" />,
                title: 'Live Collaboration',
                desc: 'Built-in messaging and video calls to keep projects moving forward.',
                color: 'from-yellow-100 to-yellow-50',
              },
              {
                icon: <FaClock className="text-lg sm:text-xl" />,
                title: 'Time Tracking',
                desc: 'Automated logs for hourly work with screenshots (optional) for transparency.',
                color: 'from-red-100 to-red-50',
              },
              {
                icon: <FaGlobe className="text-lg sm:text-xl" />,
                title: 'Global Network',
                desc: 'Access talent from around the world or find clients beyond your local market.',
                color: 'from-indigo-100 to-indigo-50',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureItemVariants}
                whileHover="hover"
                className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 shadow-sm border border-gray-100 transition-all`}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 text-green-600 text-lg sm:text-xl flex items-center justify-center mb-4 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-20 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl">
                  {stat.icon}
                </div>
                <motion.h3 
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {stat.label === 'Earned' ? `$${stat.value}K+` : `${stat.value}+`}
                </motion.h3>
                <p className="text-white/90 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            {/* Uncomment if needed */}
            {/* <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4 border border-green-200">
              <FaUsers className="mr-2" /> Community Voices
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              What Our <span className="text-green-500">Community</span> Says
            </h2> */}
          </motion.div>
          <TestimonialCarousel />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to work differently?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join our community of professionals and businesses creating the future of work.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg font-medium shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
            >
              <FaUserTie className="mr-2" /> Find Talent
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center bg-white text-gray-900 py-2 sm:py-3 px-6 sm:px-8 rounded-lg font-medium shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
            >
              <FaRocket className="mr-2" /> Start Freelancing
            </motion.button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;