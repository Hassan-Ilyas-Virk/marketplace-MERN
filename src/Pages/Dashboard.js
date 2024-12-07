import React, { useState } from 'react';
import Navigation from '../Components/Navigation.js';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [profileImage, setProfileImage] = useState(user?.profileImage);
  const [bannerColor, setBannerColor] = useState('#438951');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:5000/api/users/upload-profile-pic', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload image');
        }

        setProfileImage(data.imageUrl);
        const updatedUser = { ...user, profileImage: data.imageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSuccess('Profile image updated successfully');
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.message || 'Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const updateData = {};
    if (activeTab === 'email') {
      updateData.email = formData.email;
    } else if (activeTab === 'password') {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
      updateData.confirmPassword = formData.confirmPassword;
    } else {
      updateData.firstName = formData.firstName;
      updateData.lastName = formData.lastName;
    }

    try {
      console.log('Updating profile...', updateData);
      const response = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully');
      
      if (activeTab === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DFEEE2]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg min-h-[80vh] relative">
          <div 
            className="w-full h-48 rounded-t-lg relative"
            style={{ backgroundColor: bannerColor }}
          >
            <div className="absolute bottom-4 right-4">
              <input
                type="color"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
                title="Change banner color"
              />
            </div>
          </div>

          <div className="flex">
            <div className="w-64 -mt-20 px-6">
              <div className="relative mb-6">
                {profileImage ? (
                  <img
                    src={`http://localhost:5000${profileImage}`}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-[#4A644E] flex items-center justify-center text-white text-5xl border-4 border-white shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-2 right-2 bg-[#438951] text-white p-3 rounded-full cursor-pointer hover:bg-[#4A644E] transition-colors shadow-md">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-left rounded-md font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#438951] text-white'
                      : 'text-[#3B4540] hover:bg-[#DFEEE2]'
                  }`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-4 py-2 text-left rounded-md font-medium transition-colors ${
                    activeTab === 'email'
                      ? 'bg-[#438951] text-white'
                      : 'text-[#3B4540] hover:bg-[#DFEEE2]'
                  }`}
                >
                  Change Email
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-2 text-left rounded-md font-medium transition-colors ${
                    activeTab === 'password'
                      ? 'bg-[#438951] text-white'
                      : 'text-[#3B4540] hover:bg-[#DFEEE2]'
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 border-l border-[#D1E7D2]">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-[#DFEEE2] border border-[#438951] text-[#438951] rounded-md">
                  {success}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#3B4540]">Profile Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-[#405449]">Full Name</h3>
                      <p className="mt-1 text-lg text-[#3B4540]">{user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#405449]">Email</h3>
                      <p className="mt-1 text-lg text-[#3B4540]">{user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#405449]">Role</h3>
                      <p className="mt-1 text-lg text-[#3B4540]">{user?.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Change Email</h2>
                  <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-[#3B4540] font-medium mb-2">
                        New Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-[#D1E7D2] rounded-md focus:ring-[#438951] focus:border-[#438951]"
                        placeholder="Enter new email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-[#438951] text-white rounded-md hover:bg-[#4A644E] focus:outline-none focus:ring-2 focus:ring-[#438951] focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Change Password</h2>
                  <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-[#3B4540] font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border border-[#D1E7D2] rounded-md focus:ring-[#438951] focus:border-[#438951]"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[#3B4540] font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border border-[#D1E7D2] rounded-md focus:ring-[#438951] focus:border-[#438951]"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-[#438951] text-white rounded-md hover:bg-[#4A644E] focus:outline-none focus:ring-2 focus:ring-[#438951] focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;