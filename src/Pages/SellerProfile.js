import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../Components/Navigation.js';
import ListingItem from '../Components/listingItem.js';
import ListingStats from '../Components/ListingStats.js';
import ListingDetailModal from '../Components/ListingDetailModal.js';
import FeedbackModal from '../Components/FeedbackModal.js';
import LoadingSpinner from '../Components/LoadingSpinner.js';

const categories = [
  { id: 'all', name: 'All Listings', icon: '📋' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'property-sale', name: 'Property For Sale', icon: '🏠' },
  { id: 'property-rent', name: 'Property For Rent', icon: '🔑' },
  { id: 'electronics', name: 'Electronics & Home Appliances', icon: '📷' },
  { id: 'business', name: 'Business, Industrial & Agriculture', icon: '🚜' },
  { id: 'services', name: 'Services', icon: '🔧' }
];

const SellerProfile = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedListingForFeedback, setSelectedListingForFeedback] = useState(null);
  const [feedbacks, setFeedbacks] = useState({ 
    feedbacks: [], 
    totalPages: 1,
    totalFeedbacks: 0 
  });
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const feedbackSectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellerResponse = await fetch(`http://localhost:5000/api/users/${sellerId}`);
        if (!sellerResponse.ok) {
          throw new Error('Failed to fetch seller details');
        }
        const sellerData = await sellerResponse.json();
        console.log('Seller Data:', sellerData);
        setSeller(sellerData);

        // Fetch seller's listings
        const listingsResponse = await fetch(`http://localhost:5000/api/listings/seller/${sellerId}`);
        if (!listingsResponse.ok) {
          throw new Error('Failed to fetch listings');
        }
        const listingsData = await listingsResponse.json();
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setError(null);

        // Fetch feedbacks with pagination
        const feedbackResponse = await fetch(
          `http://localhost:5000/api/feedback/user/${sellerId}?page=${currentPage}`,
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
  }, [sellerId, currentPage]);

  const filteredListings = listings.filter(listing => 
    selectedCategory === 'all' || listing.category === selectedCategory
  );

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handleFeedbackSubmit = async () => {
    try {
      // Assume feedback submission logic here
      // ...

      // Refresh feedbacks after submission
      const feedbackResponse = await fetch(
        `http://localhost:5000/api/feedback/user/${sellerId}?page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedbacks(feedbackData);
        setTotalPages(feedbackData.totalPages);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setIsFeedbackModalOpen(true);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete feedback');
        }

        // Update the feedbacks state by removing the deleted feedback
        setFeedbacks(prev => ({
          ...prev,
          feedbacks: prev.feedbacks.filter(f => f._id !== feedbackId)
        }));
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const scrollToFeedback = () => {
    feedbackSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Seller Profile Card */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-8"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-6">
                <img
                  src={seller?.profileImage ? `http://localhost:5000${seller.profileImage}` : '/default-avatar.png'}
                  alt={`${seller?.name}'s profile`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#438951]"
                />
                <div>
                  <h1 className="text-3xl font-bold text-[#3B4540] mb-4">
                    {seller?.name}'s Profile
                  </h1>
                  <p className="text-gray-600">
                    Member since: {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Total Reviews: {feedbacks.totalFeedbacks}
                </p>
              </div>
            </motion.div>

            {/* Categories Section with animations */}
            {listings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Filter by category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl h-full
                        transition-all duration-300 shadow-sm hover:shadow-md
                        ${selectedCategory === category.id 
                          ? 'bg-[#1DB954] text-white transform scale-105' 
                          : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-[#1DB954]'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 flex items-center justify-center text-2xl mb-2 rounded-lg
                        ${selectedCategory === category.id
                          ? 'bg-white/20'
                          : 'bg-[#1DB954]/10'
                        }
                      `}>
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium text-center break-words w-full px-1 line-clamp-2">
                        {category.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analytics Section */}
            {!loading && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8"
              >
                <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Listing Analytics</h2>
                <ListingStats listings={filteredListings} />
              </motion.div>
            )}

            {/* Listings Grid with animations */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredListings.map(listing => (
                  <div key={listing._id} onClick={() => handleListingClick(listing)}>
                    <ListingItem 
                      listing={{
                        ...listing,
                        sellerId: {
                          ...listing.sellerId,
                          name: seller?.name
                        }
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Feedback Section */}
            <motion.div 
              ref={feedbackSectionRef}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mt-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#3B4540]">Feedback</h2>
                {seller?._id !== localStorage.getItem('userId') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedListingForFeedback(null);
                      setIsFeedbackModalOpen(true);
                      scrollToFeedback();
                    }}
                    className="px-4 py-2 bg-[#1DB954] text-white rounded-lg hover:bg-[#3B4540] 
                      transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    Give Feedback
                  </motion.button>
                )}
              </div>

              {feedbacksLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : feedbacks.feedbacks?.length === 0 ? (
                <p className="text-gray-600">No feedback yet</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.feedbacks
                    .sort((a, b) => {
                      // Sort by user's feedbacks first
                      const isUserA = a.givenBy._id === localStorage.getItem('userId');
                      const isUserB = b.givenBy._id === localStorage.getItem('userId');
                      if (isUserA && !isUserB) return -1;
                      if (!isUserA && isUserB) return 1;
                      // Then sort by date
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map((feedback, index) => (
                      <motion.div
                        key={feedback._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          border-b border-gray-100 pb-4 hover:bg-white/50 rounded-xl p-4
                          ${feedback.givenBy._id === localStorage.getItem('userId') ? 'bg-[#1DB954]/5' : ''}
                        `}
                      >
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
                          {console.log('Feedback user ID:', feedback.givenBy._id)}
                          {console.log('Local storage user ID:', localStorage.getItem('userId'))}
                          {feedback.givenBy._id === localStorage.getItem('userId') && (
                            <div className="flex gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditFeedback(feedback)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full 
                                  hover:bg-blue-50 transition-all duration-200"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                                  />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteFeedback(feedback._id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full 
                                  hover:bg-red-50 transition-all duration-200"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                  />
                                </svg>
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  className="flex justify-center items-center gap-4 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-[#1DB954] text-white rounded-lg hover:bg-[#3B4540] 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                      shadow-md hover:shadow-lg"
                  >
                    Previous
                  </motion.button>
                  <span className="text-gray-600 font-medium">
                    {`Page ${currentPage} of ${totalPages}`}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-[#1DB954] text-white rounded-lg hover:bg-[#3B4540] 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                      shadow-md hover:shadow-lg"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
              {isModalOpen && (
                <ListingDetailModal listing={selectedListing} onClose={closeModal} />
              )}
              <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => {
                  setIsFeedbackModalOpen(false);
                  setEditingFeedback(null);
                }}
                sellerId={sellerId}
                listingId={selectedListingForFeedback?._id}
                onSubmit={handleFeedbackSubmit}
                editingFeedback={editingFeedback}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SellerProfile);
