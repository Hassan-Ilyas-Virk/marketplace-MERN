import React from 'react';
import Navigation from '../Components/Navigation.js';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {user?.name}</p>
                        <p><span className="font-medium">Email:</span> {user?.email}</p>
                        <p><span className="font-medium">Role:</span> {user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 