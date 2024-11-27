import React from "react";

const ListingItem = ({ listing }) => {
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
      <div className="w-full h-48 overflow-hidden">
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
