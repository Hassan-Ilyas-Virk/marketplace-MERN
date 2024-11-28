import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingDetailModal from './ListingDetailModal.js';
import EditListingModal from './EditListingModal.js';

const SellerListingCard = ({ listing, onListingUpdate }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    
    try {
      console.log('Attempting to update status to:', newStatus);
      
      const response = await fetch(`http://localhost:5000/api/listings/${listing._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to update status: ${errorData}`);
      }

      const updatedListing = await response.json();
      console.log('Updated listing:', updatedListing);
      onListingUpdate(updatedListing);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this listing?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`http://localhost:5000/api/listings/${listing._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete listing');
        }

        onListingUpdate(null);
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-[#438951] text-white';
      case 'Pending': return 'bg-[#FFA500] text-white';
      case 'Sold': return 'bg-[#4A644E] text-white';
      default: return 'bg-[#438951] text-white';
    }
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image Container */}
        <div 
          className="relative aspect-w-16 aspect-h-9 overflow-hidden cursor-pointer"
          onClick={() => setShowDetailModal(true)}
        >
          <img
            src={`http://localhost:5000${listing.images[0]}`}
            alt={listing.title}
            className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-[#438951] text-white rounded-full text-sm font-medium shadow-lg">
              ${listing.price}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 
            className="text-lg font-semibold text-[#3B4540] mb-2 truncate cursor-pointer"
            onClick={() => setShowDetailModal(true)}
          >
            {listing.title}
          </h3>
          
          <p className="text-[#405449] text-sm mb-4 line-clamp-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-[#4A644E] flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {listing.location}
              </span>
              <span className="text-sm text-[#4A644E] flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {listing.category}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={listing.status}
                onChange={handleStatusChange}
                onClick={(e) => e.stopPropagation()}
                className={`px-3 py-1 rounded-full text-sm font-medium shadow-md cursor-pointer ${getStatusColor(listing.status)}`}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="p-2 text-[#438951] hover:bg-[#DFEEE2] rounded-full transition-colors"
                title="Edit Listing"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Listing"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetailModal && (
        <ListingDetailModal
          listing={listing}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showEditModal && (
        <EditListingModal
          listing={listing}
          onClose={() => setShowEditModal(false)}
          onUpdate={onListingUpdate}
        />
      )}
    </>
  );
};

export default SellerListingCard;