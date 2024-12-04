import React, { useState, useEffect } from 'react';
import Navigation from '../Components/Navigation.js';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [profileImage, setProfileImage] = useState(user?.profileImage);
  const [feedbacks, setFeedbacks] = useState({ 
    feedbacks: [], 
    totalPages: 1,
    totalFeedbacks: 0 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackResponse = await fetch(
          `http://localhost:5000/api/feedback/user/${user._id}?page=${currentPage}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (!feedbackResponse.ok) {
          throw new Error('Failed to fetch feedback');
        }
        const feedbackData = await feedbackResponse.json();
        setFeedbacks(feedbackData);
        setTotalPages(feedbackData.totalPages);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setFeedbacksLoading(false);
      }
    };

    if (user?._id) {
      fetchFeedbacks();
    }
  }, [user?._id, currentPage]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const userData = await response.json();
        setProfileImage(userData.profileImage); // Update profile image if needed
        userData && localStorage.setItem('user', JSON.stringify(userData)); // Update localStorage
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (user?._id) {
      fetchUserProfile();
    }
  }, [user?._id]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditFeedback = (feedback) => {
    setFeedbackToEdit(feedback);
    setIsEditingFeedback(true);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCurrentPage(1);
      } else {
        throw new Error('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleFeedbackSubmit = () => {
    setIsEditingFeedback(false);
    setFeedbackToEdit(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DFEEE2] to-[#F5F9F6]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-4 sm:space-y-0">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={`http://localhost:5000${profileImage}`}
                    alt="Profile"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#4A644E]/20 shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#4A644E] to-[#5B7A60] flex items-center justify-center text-white text-4xl sm:text-5xl border-4 border-[#4A644E]/20 shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-[#3B4540]">{user?.name}</h2>
                <p className="text-gray-600 mt-2">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mt-1">
                  Total Reviews: {feedbacks.totalFeedbacks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 mt-8">
          <h2 className="text-2xl font-bold text-[#3B4540] mb-6 pb-2 border-b border-gray-200">Feedback</h2>
          {feedbacksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A644E]/20 border-t-[#4A644E] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading feedback...</p>
            </div>
          ) : feedbacks.feedbacks?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.feedbacks.map((feedback) => (
                <div key={feedback._id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#3B4540]">{feedback.givenBy.name}</span>
                        <span className="text-yellow-400">
                          {'★'.repeat(feedback.rating)}
                          <span className="text-gray-300">{'★'.repeat(5 - feedback.rating)}</span>
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2 leading-relaxed">{feedback.comments}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {feedback.givenBy._id === localStorage.getItem('userId') && (
                      <div className="flex gap-3 ml-4">
                        <button
                          onClick={() => handleEditFeedback(feedback)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(feedback._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#4A644E] text-white rounded-lg hover:bg-[#3B4540] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">{`Page ${currentPage} of ${totalPages}`}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#4A644E] text-white rounded-lg hover:bg-[#3B4540] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;