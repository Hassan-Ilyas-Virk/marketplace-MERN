import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Navigation from '../Components/Navigation.js';
import LoadingSpinner from '../Components/LoadingSpinner.js';
import { FaEnvelope, FaHeading, FaCommentAlt, FaPhoneAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import emailGif from '../media/email.gif';

const ContactUs = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: user ? user.email : '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email using EmailJS
      const result = await emailjs.send(
        'service_xxxxxxx', // Your EmailJS service ID
        'template_xxxxxxx', // Your EmailJS template ID
        {
          from_name: user.name || user.email,
          from_email: user.email,
          to_email: 'shateerpathan7@gmail.com',
          subject: formData.subject,
          message: formData.message,
        },
        'public_key_xxxxxxx' // Your EmailJS public key
      );

      if (result.text === 'OK') {
        setSubmitStatus('success');
        // Reset form after success
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Email error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Add contact info cards data
  const contactInfo = [
    {
      icon: <FaPhoneAlt className="text-3xl text-[#1DB954]" />,
      title: "Phone",
      details: "+92 3039030416",
      animation: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } }
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-[#1DB954]" />,
      title: "Location",
      details: "FAST NUCES, Islamabad",
      animation: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2, delay: 0.3 } }
    },
    {
      icon: <FaClock className="text-3xl text-[#1DB954]" />,
      title: "Business Hours",
      details: "Mon - Fri, 9:00 - 18:00",
      animation: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2, delay: 0.6 } }
    }
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
        className="relative py-20 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div 
            className="relative w-[1200px] h-[300px] mx-auto rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Email GIF Background */}
            <img 
              src={emailGif}
              alt="email animation"
              className="absolute w-full h-full object-cover opacity-80"
            />
            
            {/* Text Content */}
            <div className="relative h-full flex flex-col justify-center space-y-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <motion.h1 
                className="text-7xl font-bold text-white"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Contact Us
              </motion.h1>
              <motion.p
                className="text-2xl text-white"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                We're here to help and answer any question you might have
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Info Cards */}
      <motion.div 
        className="max-w-6xl mx-auto px-4 -mt-10 mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.03 }}
            animate={info.animation}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {info.icon}
              <h3 className="text-xl font-semibold text-gray-800">{info.title}</h3>
              <p className="text-gray-600">{info.details}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Contact Form Section */}
      <motion.div 
        className="max-w-2xl mx-auto px-4 pb-20"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-gray-600">
              <FaEnvelope className="text-[#1DB954]" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 transition-all"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-gray-600">
              <FaHeading className="text-[#1DB954]" />
              <span>Subject</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 transition-all"
              placeholder="What's your query about?"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-gray-600">
              <FaCommentAlt className="text-[#1DB954]" />
              <span>Message</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 transition-all resize-none"
              placeholder="Tell us more about your query..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#1DB954] text-white rounded-lg font-semibold hover:bg-[#557C55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="small" />
                <span>Sending...</span>
              </div>
            ) : (
              'Send Message'
            )}
          </motion.button>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <motion.p 
              className="text-green-600 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Message sent successfully!
            </motion.p>
          )}
          {submitStatus === 'error' && (
            <motion.p 
              className="text-red-600 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Failed to send message. Please try again.
            </motion.p>
          )}

          {/* Add a note below the form */}
          <motion.div 
            className="text-center mt-6 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-sm">
              We typically respond within 24 hours. For urgent matters, 
              please use the phone number above.
            </p>
          </motion.div>
        </form>
      </motion.div>

      {/* Social Proof Section */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 pb-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="bg-white/50 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Why Contact Us?</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-[#1DB954]">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1DB954]">1hr</div>
              <div className="text-gray-600">Avg Response</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1DB954]">98%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactUs; 