import React, { useState, useEffect } from 'react';
import ListingItem from './listingItem.js';

const SellerProfile = ({ sellerId }) => {
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        // Fetch seller profile
        const profileResponse = await fetch(`http://localhost:5000/api/users/${sellerId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const profileData = await profileResponse.json();
        setSeller(profileData);

        // Fetch seller's listings
        const listingsResponse = await fetch(`http://localhost:5000/api/listings/seller/${sellerId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const listingsData = await listingsResponse.json();
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Seller Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src={seller?.profileImage ? `http://localhost:5000${seller.profileImage}` : '/default-avatar.png'}
              alt={seller?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{seller?.name}</h1>
            <p className="text-gray-600">Member since {new Date(seller?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Seller's Listings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Listings by {seller?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
        </div>
        {listings.length === 0 && (
          <p className="text-center text-gray-500">No listings found</p>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
