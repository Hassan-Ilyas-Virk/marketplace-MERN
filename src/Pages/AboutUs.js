import React, { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaPalette, FaCode, FaServer, FaDesktop } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Navigation from '../Components/Navigation.js';
import LoadingSpinner from '../Components/LoadingSpinner.js';
import teamGif from '../media/team.gif';

const AboutUs = () => {
  const [isLoading, setIsLoading] = useState(true);

  const teamMembers = [
    {
      name: "Samyan Ahmed",
      rollNo: "22i-2639",
      linkedin: "#",
      artstation: "#",
      role: "Full Stack Developer",
      icon: <FaCode className="text-4xl mb-4 text-[#1DB954]" />,
      contribution: "Developed the complete Seller Module including product management,Chat, and seller dashboard."
    },
    {
      name: "Hassan Ilyas",
      rollNo: "22i-2414",
      linkedin: "#",
      artstation: "#",
      role: "Backend Developer",
      icon: <FaServer className="text-4xl mb-4 text-[#1DB954]" />,
      contribution: "Implemented the Customer Module with marketplace browsing, feedback, Favorites and geo Location."
    },
    {
      name: "Shamil Sajjad",
      rollNo: "22i-2451",
      linkedin: "#",
      artstation: "#",
      role: "Frontend Developer",
      icon: <FaDesktop className="text-4xl mb-4 text-[#1DB954]" />,
      contribution: "Created the Admin Module with user management, content moderation, and analytics dashboard."
    }
  ];

  const features = [
    {
      title: "Advanced Marketplace",
      description: "Sophisticated listing system with powerful search, filters, and categories for seamless product discovery.",
      stats: ["500+ Products", "10+ Categories", "Real-time Updates"]
    },
    {
      title: "AI Chatbot Assistant",
      description: "Intelligent chatbot powered by advanced AI to help users navigate listings and provide instant support.",
      stats: ["24/7 Available", "Smart Responses", "Learning Capable"]
    },
    {
      title: "Real-time Messaging",
      description: "Seamless communication between buyers and sellers with instant messaging and notifications.",
      stats: ["Instant Delivery", "Read Receipts", "Media Sharing"]
    },
    {
      title: "User Experience",
      description: "Modern, responsive design with intuitive navigation and smooth animations for optimal user engagement.",
      stats: ["Mobile First", "Fast Loading", "Accessible"]
    }
  ];

  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Add this effect to simulate loading
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white"
    >
      <Navigation />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <motion.div 
            className="relative py-20 px-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="relative max-w-7xl mx-auto text-center">
              {/* Title Card with GIF Background */}
              <motion.div 
                className="relative w-[1200px] h-[300px] mx-auto rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                transition={{ duration: 0.3 }}
              >
                {/* GIF Background */}
                <img 
                  src={teamGif}
                  alt="team animation"
                  className="absolute w-full h-full object-cover opacity-80"
                />
                
                {/* Text on top of GIF */}
                <div className="relative h-full flex flex-col justify-center space-y-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <motion.h1 
                    className="text-7xl font-bold text-white"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    Meet Our Team
                  </motion.h1>
                  <motion.p
                    className="text-2xl text-white"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Building the future of online marketplaces with innovation and creativity
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="py-20 px-4 max-w-6xl mx-auto"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.rollNo}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="text-center">
                    {member.icon}
                    <h3 className="text-2xl font-bold text-[#1DB954] mb-2">{member.name}</h3>
                    <p className="text-gray-500 mb-2">{member.rollNo}</p>
                    <p className="text-[#557C55] font-semibold mb-4">{member.role}</p>
                    <p className="text-gray-600 mb-6">{member.contribution}</p>
                    <div className="flex justify-center space-x-4">
                      <a href={member.linkedin} className="text-gray-400 hover:text-[#1DB954] transition-colors">
                        <FaLinkedin size={24} />
                      </a>
                      <a href={member.artstation} className="text-gray-400 hover:text-[#1DB954] transition-colors">
                        <FaPalette size={24} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* University Info */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="py-20 px-4 bg-[#1DB954]/5"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <h3 className="text-3xl font-bold text-[#1DB954] mb-6">Academic Details</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="text-lg">FAST National University of Computer and Emerging Sciences, Islamabad</p>
                  <p className="text-lg">Bachelor of Science in Software Engineering</p>
                  <p className="text-lg">5th Semester</p>
                  <p className="text-lg">Web Engineering Project - Fall 2034</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="py-20 px-4 max-w-6xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center text-[#1DB954] mb-12">Project Features</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <h4 className="text-xl font-semibold text-[#557C55] mb-4">{feature.title}</h4>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {feature.stats.map((stat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#1DB954]/10 text-[#1DB954] rounded-full text-sm">
                        {stat}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default React.memo(AboutUs); 