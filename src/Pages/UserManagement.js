import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaKey, FaBars, FaTimes } from "react-icons/fa";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import { motion } from "framer-motion";

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltip, setTooltip] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  // Fetch users with error handling and type checking
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        console.log("Fetched users:", data); // Debug log

        // Ensure data is an array and has the expected structure
        if (
          Array.isArray(data) &&
          data.every(
            (user) =>
              user.hasOwnProperty("name") &&
              user.hasOwnProperty("email") &&
              user.hasOwnProperty("role")
          )
        ) {
          setUsers(data);
        } else {
          console.error("Invalid data format received:", data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle edit user
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const updatedUsers = users.map((user) =>
          user._id === selectedUser._id ? { ...user, ...editForm } : user
        );
        setUsers(updatedUsers);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle delete user with proper array update
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Use filter instead of find for removing the deleted user
        setUsers(users.filter((user) => user._id !== selectedUser._id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}/reset-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setShowResetModal(false);
        // Show success message
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      filter === "all" || user.role.toLowerCase() === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

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
            User Management
          </h1>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]"
            >
              <option value="all">All Users</option>
              <option value="customer">Customers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-gray-300 focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]"
            />
          </div>

          {/* Users Table with Enhanced Tooltips */}
          <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-700">{user.name}</td>
                    <td className="p-4 text-gray-700">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "Seller"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onMouseEnter={(e) => {
                            setTooltip({
                              show: true,
                              text: "Edit user details",
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }}
                          onMouseLeave={() => setTooltip({ show: false })}
                          onClick={() => {
                            setSelectedUser(user);
                            setEditForm({
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              status: user.status || "Active",
                            });
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onMouseEnter={(e) => {
                            setTooltip({
                              show: true,
                              text: "Delete user account",
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }}
                          onMouseLeave={() => setTooltip({ show: false })}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onMouseEnter={(e) => {
                            setTooltip({
                              show: true,
                              text: "Reset user password",
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }}
                          onMouseLeave={() => setTooltip({ show: false })}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors duration-200"
                        >
                          <FaKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>

          {/* Tooltip */}
          {tooltip.show && (
            <div
              className="fixed bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none z-50"
              style={{
                left: `${tooltip.x + 10}px`,
                top: `${tooltip.y + 10}px`,
              }}
            >
              {tooltip.text}
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold mb-4">Edit User</h2>
                <form onSubmit={handleEdit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1DB954] focus:ring-[#1DB954]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1DB954] focus:ring-[#1DB954]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1DB954] focus:ring-[#1DB954]"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1DB954] focus:ring-[#1DB954]"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1DB954] text-white rounded-md hover:bg-[#3B4540]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold mb-4">Delete User</h2>
                <p className="mb-6">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Reset Password Modal */}
          {showResetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                <p className="mb-6">
                  Are you sure you want to reset the password for this user?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Reset Password
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;
