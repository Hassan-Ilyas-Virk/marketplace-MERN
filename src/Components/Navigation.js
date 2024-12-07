import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-[#1DB954] border-b-2 border-[#1DB954]' : 'text-gray-700';
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-full mx-2 sm:mx-4">
        <div className="flex justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link 
              to={user?.role === 'Seller' ? '/seller' : '/'} 
              className="text-3xl font-bold text-[#1DB954] mr-8 hover:scale-105 transition-transform font-['Dancing_Script']"
            >
              Samshas
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link
                to={`/user/${user?._id}`}
                className={`${isActive(`/user/${user?._id}`)} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5`}
              >
                Profile
              </Link>
              <Link
                to="/chat"
                className={`${isActive('/chat')} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5`}
              >
                Chat
              </Link>
              {user?.role === 'Seller' && (
                <>
                  <Link
                    to="/seller"
                    className={`${isActive('/seller')} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/create-listing"
                    className={`${isActive('/create-listing')} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    Create Listing
                  </Link>
                </>
              )}
              {/* New Pages */}
              <Link
                to="/about"
                className={`${isActive('/about')} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={`${isActive('/contact')} hover:text-[#1DB954] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:-translate-y-0.5`}
              >
                Contact
              </Link>
            </div>
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

          {/* Right side - Profile Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="flex items-center">
                  {user?.profileImage ? (
                    <img
                      src={`http://localhost:5000${user.profileImage}`}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-[#1DB954] transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#1DB954] flex items-center justify-center text-white text-lg transition-transform group-hover:scale-105">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <svg className={`ml-2 h-5 w-5 text-gray-600 transition-all duration-300 group-hover:text-[#1DB954] ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Desktop Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-[#1DB954] ring-opacity-20">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#1DB954] hover:text-white transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Manage Profile
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#1DB954] hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <svg
                        className="mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden bg-white border-t border-gray-100 py-2"
          >
            <div className="flex items-center space-x-3 px-4 py-2 border-b border-gray-100">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#1DB954]"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#1DB954] flex items-center justify-center text-white text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="text-gray-700 font-medium">{user?.name}</span>
            </div>
            
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  className="mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Manage Profile
              </Link>

              <Link
                to={`/user/${user?._id}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/chat"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chat
              </Link>
              {user?.role === 'Seller' && (
                <>
                  <Link
                    to="/seller"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/create-listing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Listing
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-gray-50 transition-all duration-200 flex items-center"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 