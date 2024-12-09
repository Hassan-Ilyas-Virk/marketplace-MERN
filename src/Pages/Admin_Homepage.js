import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import { motion } from "framer-motion";
import axios from "axios";

const Admin_Homepage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeSellers: 0,
    customerCount: 0,
    sellerCount: 0,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Modified fetchStats function
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Stats received:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Add this useEffect to monitor stats changes
  useEffect(() => {
    console.log("Stats updated:", stats);
  }, [stats]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error loading statistics: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white"
    >
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-2 sm:mx-4">
          <div className="flex justify-between h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
              <Link
                to="/admin"
                className="text-3xl font-bold text-[#1DB954] mr-8 hover:scale-105 transition-transform font-['Dancing_Script']"
              >
                Samshas Admin
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex space-x-8">
                <Link
                  to="/admin/users"
                  className="text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                >
                  User Management
                </Link>
                <Link
                  to="/admin/listings"
                  className="text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                >
                  Listing Management
                </Link>
                <Link
                  to="/admin/reports"
                  className="text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                >
                  Reports
                </Link>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700 font-medium">{user?.name}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-[#1DB954] transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/admin/users"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50"
                >
                  User Management
                </Link>
                <Link
                  to="/admin/listings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50"
                >
                  Listing Management
                </Link>
                <Link
                  to="/admin/reports"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50"
                >
                  Reports
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3B4540] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[#557C55] text-sm sm:text-base">
            Welcome back, {user?.name}! Here's your overview for today.
          </p>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 relative group"
            onClick={() => setShowUserModal(true)}
          >
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-2 text-[#3B4540]">
                Total Users
              </h2>
              <p className="text-3xl font-bold text-[#1DB954] mb-2">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-gray-600 mt-auto">
                Click for detailed breakdown →
              </p>
              <div className="absolute inset-0 bg-[#1DB954] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-[#3B4540]">
              Total Listings
            </h2>
            <p className="text-3xl font-bold text-[#1DB954] mb-2">
              {stats.totalListings}
            </p>
            <p className="text-sm text-gray-600">Active marketplace items</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-[#3B4540]">
              Active Sellers
            </h2>
            <p className="text-3xl font-bold text-[#1DB954] mb-2">
              {stats.activeSellers}
            </p>
            <p className="text-sm text-gray-600">Registered selling accounts</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-[#3B4540]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/admin/users"
                className="block bg-[#1DB954] text-white p-4 rounded-lg hover:bg-[#3B4540] transition-all duration-300 text-center shadow-md hover:shadow-lg"
              >
                <span className="block text-lg mb-1">Manage Users</span>
                <span className="text-sm opacity-90">
                  View and manage user accounts
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/admin/listings"
                className="block bg-[#1DB954] text-white p-4 rounded-lg hover:bg-[#3B4540] transition-all duration-300 text-center shadow-md hover:shadow-lg"
              >
                <span className="block text-lg mb-1">Manage Listings</span>
                <span className="text-sm opacity-90">
                  Monitor marketplace items
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/admin/reports"
                className="block bg-[#1DB954] text-white p-4 rounded-lg hover:bg-[#3B4540] transition-all duration-300 text-center shadow-md hover:shadow-lg"
              >
                <span className="block text-lg mb-1">View Reports</span>
                <span className="text-sm opacity-90">
                  Check user reports and issues
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced User Stats Modal */}
      {showUserModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#3B4540]">
                User Statistics
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                <div>
                  <span className="font-semibold text-[#3B4540] block">
                    Customers
                  </span>
                  <span className="text-sm text-gray-600">Regular users</span>
                </div>
                <span className="text-2xl text-[#1DB954] font-bold">
                  {stats.customerCount}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                <div>
                  <span className="font-semibold text-[#3B4540] block">
                    Sellers
                  </span>
                  <span className="text-sm text-gray-600">
                    Business accounts
                  </span>
                </div>
                <span className="text-2xl text-[#1DB954] font-bold">
                  {stats.sellerCount}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors border-t-2 border-[#A6CF98]">
                <div>
                  <span className="font-semibold text-[#3B4540] block">
                    Total Users
                  </span>
                  <span className="text-sm text-gray-600">
                    Platform-wide users
                  </span>
                </div>
                <span className="text-2xl text-[#1DB954] font-bold">
                  {stats.totalUsers}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserModal(false)}
              className="mt-6 w-full bg-[#1DB954] text-white py-3 rounded-lg hover:bg-[#3B4540] transition-colors duration-300 shadow-md hover:shadow-lg font-semibold"
            >
              Close Details
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Admin_Homepage;
