import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaFlag, FaChartBar } from "react-icons/fa";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import geminiLogo from '../assets/gemini.png';

// Register the necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsChart = ({ analytics }) => {
  const data = {
    labels: analytics.popularCategories.map((cat) => cat.name),
    datasets: [
      {
        label: "Popular Categories",
        data: analytics.popularCategories.map((cat) => cat.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return <Bar data={data} />;
};

const UserStatisticsChart = ({ userStats }) => {
  const chartData = {
    labels: ['Customers', 'Sellers', 'Total Users'],
    datasets: [{
      label: 'User Statistics',
      data: [
        userStats.customerCount || 0,
        userStats.sellerCount || 0,
        userStats.totalUsers || 0
      ],
      backgroundColor: [
        'rgba(29, 185, 84, 0.6)',  // Green for Customers
        'rgba(85, 124, 85, 0.6)',  // Dark green for Sellers
        'rgba(166, 207, 152, 0.6)' // Light green for Total
      ],
      borderColor: [
        'rgb(29, 185, 84)',
        'rgb(85, 124, 85)',
        'rgb(166, 207, 152)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Statistics Overview',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

const ListingViewsChart = ({ listings }) => {
  // Sort listings by views and get top 5
  const topListings = [...listings]
    .filter(listing => listing.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const chartData = {
    labels: topListings.map(listing => listing.title.substring(0, 15) + '...'),
    datasets: [{
      label: 'Views',
      data: topListings.map(listing => listing.views),
      backgroundColor: 'rgba(29, 185, 84, 0.6)',
      borderColor: 'rgb(29, 185, 84)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Most Viewed Listings',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

const ReportsChatbot = ({ listings }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef(null);
  const [typingInterval, setTypingInterval] = useState(null);

  const API_KEY = "AIzaSyD8LyEhycHovd5oSkGyyVAaKeUyhknFlaQ";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const showTypingEffect = (text, callback) => {
    const words = text.split(" ");
    let currentText = "";
    let currentWordIndex = 0;

    const interval = setInterval(() => {
      currentText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
      callback(currentText);

      if (currentWordIndex === words.length) {
        clearInterval(interval);
        setTypingInterval(null);
        setIsGenerating(false);
      }
    }, 75);

    setTypingInterval(interval);
  };

  const handleStopResponse = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      setTypingInterval(null);
      setIsGenerating(false);
    }
  };

  const generateReportSummary = () => {
    // Sort listings by views and get top 5
    const topListings = [...listings]
      .filter(listing => listing.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return `Here's a summary of the most viewed listings:
${topListings.map((listing, index) => `${index + 1}. "${listing.title}" with ${listing.views} views`).join('\n')}

Total number of listings with views: ${listings.filter(l => l.views > 0).length}
Average views per listing: ${(listings.reduce((acc, curr) => acc + (curr.views || 0), 0) / listings.length).toFixed(2)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating) return;

    setIsGenerating(true);
    
    const newUserMessage = {
      type: 'outgoing',
      content: userInput,
      avatar: 'user_profile_picture.jpg'
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    try {
      let response;
      
      if (userInput.toLowerCase().includes('give report')) {
        // Generate local report summary
        const reportSummary = generateReportSummary();
        response = {
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: reportSummary }]
              }
            }]
          })
        };
      } else {
        // Use Gemini API for other queries
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ 
              role: "user", 
              parts: [{ text: userInput + "\n\nPlease keep your response within 5 lines." }] 
            }],
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiResponse = data?.candidates[0].content.parts[0].text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );

      const botMessage = {
        type: 'incoming',
        content: '',
        avatar: geminiLogo
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      showTypingEffect(apiResponse, (text) => {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { ...botMessage, content: text }
        ]);
      });

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'incoming',
        content: `Error: ${error.message}`,
        avatar: geminiLogo,
        error: true
      }]);
      setIsGenerating(false);
    }
  };

  const chatVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="chat"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-96 bg-white rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center">
                <img src={geminiLogo} alt="Gemini Logo" className="w-8 h-8 mr-2" />
                <span className="font-semibold">Reports Assistant</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4" ref={chatContainerRef}>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`flex ${message.type === 'incoming' ? 'justify-start' : 'justify-end'} mb-4`}
                  >
                    <div className={`flex items-start max-w-[75%] ${message.error ? 'text-red-500' : ''}`}>
                      <img 
                        src={message.avatar} 
                        alt={`${message.type} avatar`} 
                        className="w-8 h-8 rounded-full mr-2" 
                      />
                      <div className={`p-3 rounded-lg ${
                        message.type === 'incoming' 
                          ? 'bg-gray-100' 
                          : 'bg-green-500 text-white'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about listing views..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isGenerating}
                />
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopResponse}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Send
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 flex items-center justify-center"
          >
            <FaChartBar className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const ViewReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flagged"); // 'flagged' or 'analytics'
  const [reports, setReports] = useState({
    flaggedItems: [],
    analytics: {
      totalSales: 0,
      popularCategories: [],
      userActivity: {
        newUsers: 0,
        activeUsers: 0,
      },
    },
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [popularListings, setPopularListings] = useState([]);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('users');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const listingsRes = await fetch('http://localhost:5000/api/listings/popular', { headers });

        if (!listingsRes.ok) {
          throw new Error('Failed to fetch listings data');
        }

        const listingsData = await listingsRes.json();
        console.log('Fetched listings:', listingsData);

        setPopularListings(Array.isArray(listingsData) ? listingsData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch flagged items
        const flaggedResponse = await fetch(
          "http://localhost:5000/api/reports/flagged",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const flaggedData = await flaggedResponse.json();

        // Fetch analytics
        const analyticsResponse = await fetch(
          "http://localhost:5000/api/reports/analytics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const analyticsData = await analyticsResponse.json();

        setReports({
          flaggedItems: flaggedData,
          analytics: analyticsData,
        });
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/reports/users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      if (!selectedUser) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/reports/analytics/${selectedUser}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setUserAnalytics(data);
      } catch (error) {
        console.error("Error fetching user analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [selectedUser]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await fetch(
        "http://localhost:5000/api/reports/analytics",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setAnalytics(data);
    };

    fetchAnalytics();
  }, []);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/listings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Listings data:', data);
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/listings/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setReports((prev) => ({
          ...prev,
          flaggedItems: prev.flaggedItems.filter((item) => item._id !== itemId),
        }));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleDismissFlag = async (itemId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/listings/${itemId}/flag`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFlagged: false }),
        }
      );

      if (response.ok) {
        setReports((prev) => ({
          ...prev,
          flaggedItems: prev.flaggedItems.filter((item) => item._id !== itemId),
        }));
      }
    } catch (error) {
      console.error("Error dismissing flag:", error);
    }
  };

  const renderUsersTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user._id}
              className={`hover:bg-gray-50 transition-colors ${
                selectedUser === user._id ? "bg-green-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => setSelectedUser(user._id)}
                  className="text-[#1DB954] hover:text-green-700 transition-colors"
                >
                  View Analytics
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {renderUsersTable()}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <PopularListingsChart listings={popularListings} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <UserStatisticsChart userStats={userStats} />
        </div>
      </div>
      
      {/* Existing analytics content */}
      {userAnalytics && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">User Overview</h3>
            <p className="text-gray-600">Name: {userAnalytics.userData.name}</p>
            <p className="text-gray-600">Role: {userAnalytics.userData.role}</p>
            <p className="text-gray-600">
              Joined:{" "}
              {new Date(userAnalytics.userData.joinedDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Sales Overview</h3>
            <p className="text-3xl font-bold text-[#1DB954]">
              ${userAnalytics.analytics.totalSales}
            </p>
            <p className="text-gray-600">Total Sales</p>
            <p className="mt-2">
              Items Sold: {userAnalytics.analytics.totalSoldItems}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">
              Category Distribution
            </h3>
            <div className="space-y-2">
              {userAnalytics.analytics.categoryDistribution.map((category) => (
                <div
                  key={category.name}
                  className="flex justify-between items-center"
                >
                  <span>{category.name}</span>
                  <span className="text-[#1DB954] font-semibold">
                    {category.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCharts = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
      <div className="flex space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveChart('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeChart === 'users'
              ? 'bg-[#1DB954] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          User Statistics
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveChart('listings')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeChart === 'listings'
              ? 'bg-[#1DB954] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Listing Views
        </motion.button>
      </div>

      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full"
      >
        {activeChart === 'users' ? (
          <UserStatisticsChart userStats={userStats} />
        ) : (
          <ListingViewsChart listings={listings} />
        )}
      </motion.div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white"
    >
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-2 sm:mx-4">
          <div className="flex justify-between h-16">
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
                  to="/admin"
                  className={`text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    location.pathname === "/admin" ? "text-[#1DB954]" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className={`text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    location.pathname === "/admin/users" ? "text-[#1DB954]" : ""
                  }`}
                >
                  User Management
                </Link>
                <Link
                  to="/admin/listings"
                  className={`text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    location.pathname === "/admin/listings"
                      ? "text-[#1DB954]"
                      : ""
                  }`}
                >
                  Listings
                </Link>
                <Link
                  to="/admin/reports"
                  className={`text-gray-700 hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    location.pathname === "/admin/reports"
                      ? "text-[#1DB954]"
                      : ""
                  }`}
                >
                  Reports
                </Link>
              </div>
            </div>

            {/* Profile and Logout */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Admin Panel</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-[#1DB954]"
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
            <div className="md:hidden bg-white border-t border-gray-100 p-4">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-[#1DB954]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="text-gray-700 hover:text-[#1DB954]"
                >
                  User Management
                </Link>
                <Link
                  to="/admin/listings"
                  className="text-gray-700 hover:text-[#1DB954]"
                >
                  Listings
                </Link>
                <Link
                  to="/admin/reports"
                  className="text-gray-700 hover:text-[#1DB954]"
                >
                  Reports
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 text-left"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#3B4540] mb-4">
            Listing Views Report
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <ListingViewsChart listings={listings} />
            </div>
          )}
        </div>
      </div>
      <ReportsChatbot listings={listings} />
    </motion.div>
  );
};

export default ViewReports;
