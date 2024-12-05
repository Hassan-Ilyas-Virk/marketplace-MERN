import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import FeedbackModal from '../Components/FeedbackModal.js';

const CustomerProfile = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState({ 
    feedbacks: [], 
    totalPages: 1,
    totalFeedbacks: 0 
  });
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user data
        const userResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }

        // Fetch customer details
        const customerResponse = await fetch(`http://localhost:5000/api/users/${customerId}`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer details');
        }
        const customerData = await customerResponse.json();
        console.log('Customer Data:', customerData);
        setCustomer(customerData);

        // Fetch feedbacks with pagination
        const feedbackResponse = await fetch(
          `http://localhost:5000/api/feedback/user/${customerId}?page=${currentPage}`,
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
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
        setFeedbacksLoading(false);
      }
    };

    fetchData();
  }, [customerId, currentPage]);

  const handleFeedbackSubmit = async () => {
    try {
      console.log('Refreshing feedback after submission');
      const feedbackResponse = await fetch(
        `http://localhost:5000/api/feedback/user/${customerId}?page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!feedbackResponse.ok) {
        throw new Error('Failed to fetch updated feedback');
      }
      
      const feedbackData = await feedbackResponse.json();
      setFeedbacks(feedbackData);
      setTotalPages(feedbackData.totalPages);
      
      // Close the modal
      setIsFeedbackModalOpen(false);
      setEditingFeedback(null);
    } catch (error) {
      console.error('Error refreshing feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#DFEEE2]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Customer Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={customer?.profileImage ? `http://localhost:5000${customer.profileImage}` : '/default-avatar.png'}
              alt={`${customer?.name}'s profile`}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#438951]"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#3B4540] mb-4">
                {customer?.name}'s Profile
              </h1>
              <p className="text-gray-600">
                Member since: {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-600">
              Total Reviews: {feedbacks.totalFeedbacks}
            </p>
            {currentUser?.isSeller && currentUser?._id !== customer?._id && (
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="bg-[#438951] text-white px-4 py-2 rounded-lg hover:bg-[#357641] transition-colors"
              >
                Leave Feedback
              </button>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Feedback</h2>
          
          {feedbacksLoading ? (
            <div className="text-center py-4">Loading feedback...</div>
          ) : feedbacks.feedbacks?.length === 0 ? (
            <p className="text-gray-600">No feedback yet</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.feedbacks.map((feedback) => (
                <div key={feedback._id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{feedback.givenBy.name}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(feedback.rating)}
                          {'☆'.repeat(5 - feedback.rating)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{feedback.comments}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {feedback.givenBy._id === currentUser?._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingFeedback(feedback);
                            setIsFeedbackModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this feedback?')) {
                              try {
                                const response = await fetch(
                                  `http://localhost:5000/api/feedback/${feedback._id}`,
                                  {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                  }
                                );
                                
                                if (response.ok) {
                                  handleFeedbackSubmit(); // Refresh feedback list
                                } else {
                                  throw new Error('Failed to delete feedback');
                                }
                              } catch (error) {
                                console.error('Error deleting feedback:', error);
                                alert('Failed to delete feedback');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#438951] text-white rounded-lg hover:bg-[#357641] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#438951] text-white rounded-lg hover:bg-[#357641] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* FeedbackModal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setEditingFeedback(null);
          }}
          userId={customerId}
          sellerId={currentUser?._id}
          onSubmit={handleFeedbackSubmit}
          editingFeedback={editingFeedback}
        />
      </div>
    </div>
  );
};

export default CustomerProfile; 