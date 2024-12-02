import React, { useState } from 'react';

const ListingDetailModal = ({ listing, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image carousel */}
          <div className="relative w-full md:w-1/2">
            <div className="relative h-64 md:h-96">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={`http://localhost:5000${listing.images[currentImageIndex]}`}
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  No Image Available
                </div>
              )}

              {listing.images && listing.images.length > 1 && (
                <>
                  {/* Navigation arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    →
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Listing details */}
          <div className="p-6 w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">{listing.title}</h2>
            
            <div className="mb-4">
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm
                ${listing.status === 'Active' ? 'bg-green-500' : 
                  listing.status === 'Sold' ? 'bg-red-500' : 'bg-yellow-500'} 
                text-white
              `}>
                {listing.status}
              </span>
            </div>

            <p className="text-2xl font-bold text-green-600 mb-4">
              ${listing.price}
            </p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold">Category</h3>
                <p className="text-gray-600">{listing.category}</p>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-gray-600">{listing.location}</p>
              </div>
              <div>
                <h3 className="font-semibold">Views</h3>
                <p className="text-gray-600">{listing.views || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold">Listed On</h3>
                <p className="text-gray-600">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal; 