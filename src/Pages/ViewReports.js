import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaFlag, FaChartBar } from "react-icons/fa";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import { motion } from "framer-motion";
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userAnalytics ? (
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
      ) : (
        <div className="col-span-3 text-center py-8 text-gray-500">
          Select a user from the table to view their analytics
        </div>
      )}
      <div className="col-span-3">
        <AnalyticsChart analytics={reports.analytics} />
      </div>
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
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#3B4540] mb-4">
            Platform Reports
          </h1>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("flagged")}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === "flagged"
                  ? "bg-[#1DB954] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFlag className="mr-2" />
              Flagged Items
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === "analytics"
                  ? "bg-[#1DB954] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaChartBar className="mr-2" />
              Analytics
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "flagged" ? (
            <div className="space-y-4">
              {reports.flaggedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No flagged items to display
                </div>
              ) : (
                reports.flaggedItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-gray-600">{item.reason}</p>
                        <p className="text-sm text-gray-500">
                          Reported by: {item.reportedBy?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(item.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleDismissFlag(item._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {renderUsersTable()}
              {renderAnalytics()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ViewReports;
