import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-8">
                        <Link to="/dashboard" className="text-xl font-semibold">
                            Marketplace
                        </Link>
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/dashboard" className="hover:text-blue-600">
                                Dashboard
                            </Link>
                            <Link to="/listings" className="hover:text-blue-600">
                                Listings
                            </Link>
                            {user?.role === 'Seller' && (
                                <Link to="/create-listing" className="hover:text-blue-600">
                                    Create Listing
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">Welcome, {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 