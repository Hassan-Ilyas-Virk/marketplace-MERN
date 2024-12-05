import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ListingItem = ({ listing }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewCount, setViewCount] = useState(listing.views);

  useEffect(() => {
    console.log('Listing data:', listing);
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/favorites/${listing._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (listing) {
      checkFavoriteStatus();
    }
  }, [listing]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      if (!localStorage.getItem('token')) {
        alert('Please log in to save favorites');
        return;
      }

      const method = isFavorite ? 'DELETE' : 'POST';
      console.log('Making request:', {
        method,
        listingId: listing._id
      });

      const response = await fetch('http://localhost:5000/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          listingId: listing._id
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        setIsFavorite(!isFavorite);
        console.log('Successfully updated favorite status');
      } else {
        console.error('Error response:', responseData);
        alert(responseData.message || 'Failed to update favorite');
      }
    } catch (error) {
      console.error('Full error:', error);
      alert('Error updating favorite');
    }
  };

  const handleSellerClick = (e) => {
    e.stopPropagation();
    console.log('Seller ID:', listing.sellerId);
    const id = typeof listing.sellerId === 'object' ? listing.sellerId._id : listing.sellerId;
    if (!id) {
      console.error('No seller ID found');
      return;
    }
    navigate(`/seller/${id}`);
  };

  const handleContactSeller = async (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert('Please log in to contact seller');
        return;
    }

    try {
        if (user._id === listing.sellerId._id) {
            alert("You cannot message yourself!");
            return;
        }

        const response = await fetch('http://localhost:5000/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                customerId: user._id,
                sellerId: typeof listing.sellerId === 'object' ? listing.sellerId._id : listing.sellerId
            })
        });

        if (response.ok) {
            const chat = await response.json();
            console.log('Chat created:', chat);
            navigate('/chat');
        } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            alert(errorData.message || 'Failed to create chat');
        }
    } catch (error) {
        console.error('Error creating chat:', error);
        alert('Error creating chat. Please try again.');
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
    sellerId,
  } = listing;

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Image */}
      <div className="w-full h-48 overflow-hidden relative">
        {images && images.length > 0 ? (
          <img
            src={`http://localhost:5000${images[0]}`}
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
          className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all z-10"
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
        <p className="text-sm text-gray-500 mb-2">
          Listed by: <span 
            onClick={handleSellerClick}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {typeof listing.sellerId === 'object' ? listing.sellerId.name : seller?.name || 'Unknown Seller'}
          </span>
        </p>
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
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600">
            View Details
          </button>
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded hover:bg-gray-200"
          >
            <svg
              className={`w-5 h-5 ${
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
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
        <button 
            onClick={handleContactSeller}
            className="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600"
        >
            Contact Seller
        </button>
      </div>
    </div>
  );
};

export default ListingItem;
