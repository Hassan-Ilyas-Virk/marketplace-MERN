import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import ListingItem from '../Components/listingItem.js';
import ListingStats from '../Components/ListingStats.js';
import ListingDetailModal from '../Components/ListingDetailModal.js';
import FeedbackModal from '../Components/FeedbackModal.js';

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

  return (
    <div className="min-h-screen bg-[#DFEEE2]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
  
        </div>

        {/* Only show categories, analytics, and listings if there are listings */}
        {listings.length > 0 && (
          <>
            {/* Categories Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Filter by category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center p-4 rounded-lg transition-all
                      ${selectedCategory === category.id 
                        ? 'bg-[#438951] text-white shadow-md transform scale-105' 
                        : 'bg-white hover:bg-[#F3F8F3] border border-[#D1E7D2] hover:shadow-md'
                      }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">
                      {category.icon}
                    </div>
                    <span className="text-sm text-center">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analytics Section */}
            {!loading && !error && (
              <div className="p-4">
                <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Listing Analytics</h2>
                <ListingStats listings={filteredListings} />
              </div>
            )}

            {/* Listings Section */}
            <div className="p-4">
              <h2 className="text-2xl font-bold text-[#3B4540] mt-8 mb-6">
                Listings by {seller?.name}
              </h2>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#405449]">
                    {selectedCategory === 'all' 
                      ? "This seller hasn't created any listings yet."
                      : `No listings found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Modal Component */}
        {isModalOpen && (
          <ListingDetailModal listing={selectedListing} onClose={closeModal} />
        )}

        {/* Add FeedbackModal */}
        <div className="py-8">
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
                    {feedback.givenBy._id === localStorage.getItem('userId') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFeedback(feedback)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(feedback._id)}
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
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-4">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
