import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "../Components/Navigation.js";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import emailGif from "../media/email.gif";

const ContactUs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  const contactInfo = [
    {
      icon: <FaPhoneAlt className="text-3xl text-[#1DB954]" />,
      title: "Phone",
      details: "+92 3039030416",
      animation: {
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 2 },
      },
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-[#1DB954]" />,
      title: "Location",
      details: "FAST NUCES, Islamabad",
      animation: {
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 2, delay: 0.3 },
      },
    },
    {
      icon: <FaClock className="text-3xl text-[#1DB954]" />,
      title: "Business Hours",
      details: "Mon - Fri, 9:00 - 18:00",
      animation: {
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 2, delay: 0.6 },
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white"
    >
      <Navigation />

      {/* Hero Section */}
      <motion.div
        className="relative py-16 px-8 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={emailGif}
              alt="email animation"
              className="w-full h-[400px] object-cover"
            />

            <motion.div
              className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-bold text-white mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                Get in Touch
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                We're here to help and answer any question you might have
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Info Cards */}
      <motion.div
        className="max-w-7xl mx-auto px-8 -mt-10 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.03 }}
            animate={info.animation}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {info.icon}
              <h3 className="text-xl font-semibold text-gray-800">
                {info.title}
              </h3>
              <p className="text-gray-600">{info.details}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Admin Contact Section */}
      <motion.div
        className="max-w-4xl mx-auto px-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white rounded-xl shadow-xl p-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <FaEnvelope className="text-4xl text-[#1DB954] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Contact Admin
            </h2>
            <p className="text-gray-600 mb-6">
              For any inquiries or support, please email our admin directly at:
            </p>
            <a
              href="mailto:shamilsajjad398@gmail.com"
              className="text-xl font-semibold text-[#1DB954] hover:text-[#557C55] transition-colors"
            >
              shamilsajjad398@gmail.com
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Social Proof Section */}
      <motion.div
        className="max-w-6xl mx-auto px-8 pb-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-white/50 rounded-xl p-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-3xl font-bold text-[#1DB954] mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1DB954] mb-2">1hr</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1DB954] mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactUs;
