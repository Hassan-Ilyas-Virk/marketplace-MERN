import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const ListingDetailModal = ({ listing, onClose }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleConfirmOrder = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${listing._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'Pending' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update listing status');
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error confirming order:', error);
      alert(error.message || 'Failed to confirm order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactSeller = () => {
    navigate('/chat', { state: { sellerId: listing.sellerId } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
          title="Close"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-2/3 bg-gray-50">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={`http://localhost:5000${listing.images[currentImageIndex]}`}
                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}

            {listing.images && listing.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                  title="Previous Image"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                  title="Next Image"
                >
                  <FaArrowRight />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 w-full md:w-1/3 h-full overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">{listing.title}</h2>

            <div className="mb-4">
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                  listing.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : listing.status === 'Sold'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {listing.status}
              </span>
            </div>

            <p className="text-2xl font-semibold text-green-600 mb-4">${listing.price}</p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Seller</h3>
              <p
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate(`/seller/${listing.sellerId._id}`)}
              >
                {listing.sellerId?.name || 'Unknown Seller'}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold">Category</h3>
                <p className="text-gray-600">{listing.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Location</h3>
                <p className="text-gray-600">{listing.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Views</h3>
                <p className="text-gray-600">{listing.views || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Listed On</h3>
                <p className="text-gray-600">{new Date(listing.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              {listing.status === 'Active' && (
                <button
                  onClick={handleConfirmOrder}
                  disabled={isUpdating}
                  className="flex items-center px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Processing...' : 'Confirm Order'}
                </button>
              )}
              <button
                onClick={handleContactSeller}
                className="flex items-center px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaEnvelope className="mr-2" />
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal;
