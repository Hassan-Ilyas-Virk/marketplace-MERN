import React, { useState, useEffect } from "react";

const ListingItem = ({ listing }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/favorites/${listing._id}`);
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (listing) {
      checkFavoriteStatus();
    }
  }, [listing]);

  const handleFavoriteClick = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: listing._id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!listing) return <p className="text-center text-gray-500">Loading...</p>;

  const {
    title,
    description,
    price,
    category,
    images,
    location,
    status,
    views,
  } = listing;

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Image */}
      <div className="w-full h-48 overflow-hidden relative">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
            No image available
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all"
        >
          <svg
            className={`w-6 h-6 ${
              isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-600'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">Category: {category}</p>
        <p className="text-gray-700 text-sm line-clamp-3">{description}</p>
        <p className="text-lg text-green-600 font-semibold mt-2">
          ${price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">Location: {location}</p>
        <p className="text-sm text-gray-500">Status: {status}</p>
        <p className="text-sm text-gray-400">Views: {views}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600">
          View Details
        </button>
        <button className="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600">
          Contact Seller
        </button>
      </div>
    </div>
  );
};

export default ListingItem;
