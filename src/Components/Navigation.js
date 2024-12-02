import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
    return location.pathname === path ? 'text-[#438951]' : 'text-[#3B4540]';
  };

  return (
    <nav className="bg-[#F3F8F3] shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link 
              to={user?.role === 'Seller' ? '/seller' : '/'} 
              className="text-xl font-bold text-[#438951] mr-8"
            >
              Marketplace
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard')} hover:text-[#438951] px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Profile
              </Link>
              <Link
                to="/seller"
                className={`${isActive('/seller')} hover:text-[#438951] px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                My Listings
              </Link>
              <Link
                to="/create-listing"
                className={`${isActive('/create-listing')} hover:text-[#438951] px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Create Listing
              </Link>
            </div>
          </div>

          {/* Right side - Profile Menu */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="flex items-center">
                  {user?.profileImage ? (
                    <img
                      src={`http://localhost:5000${user.profileImage}`}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover border-2 border-[#D1E7D2]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#438951] flex items-center justify-center text-white text-lg">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <svg
                    className={`ml-2 h-5 w-5 text-[#405449] transition-transform duration-200 ${
                      isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-[#D1E7D2] z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-[#3B4540] hover:bg-[#DFEEE2]"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="mr-3 h-5 w-5 text-[#438951]"
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
                    className="block w-full text-left px-4 py-2 text-sm text-[#3B4540] hover:bg-[#DFEEE2]"
                  >
                    <div className="flex items-center">
                      <svg
                        className="mr-3 h-5 w-5 text-[#438951]"
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
      </div>
    </nav>
  );
};

export default Navigation; 