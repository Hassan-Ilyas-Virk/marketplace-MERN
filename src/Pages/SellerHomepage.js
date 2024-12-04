import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import SellerListingCard from '../Components/SellerListingCard.js';
import ListingStats from '../Components/ListingStats.js';

const categories = [
  { id: 'all', name: 'All Listings', icon: '📋' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'property-sale', name: 'Property For Sale', icon: '🏠' },
  { id: 'property-rent', name: 'Property For Rent', icon: '🔑' },
  { id: 'electronics', name: 'Electronics & Home Appliances', icon: '📷' },
  { id: 'business', name: 'Business, Industrial & Agriculture', icon: '🚜' },
  { id: 'services', name: 'Services', icon: '🔧' }
];

const SellerHomepage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchSellerListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listings/seller', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Seller') {
      fetchSellerListings();
    }
  }, []);

  const handleListingUpdate = async (updatedListing) => {
    if (!updatedListing) {
      // If null, it means the listing was deleted
      await fetchSellerListings();
    } else {
      // Update the specific listing in the listings array
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === updatedListing._id ? updatedListing : listing
        )
      );
    }
  };

  const filteredListings = listings.filter(listing => 
    selectedCategory === 'all' || listing.category === selectedCategory
  );

  // Redirect if not logged in or not a seller
  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#DFEEE2]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <>
            <h2 className="text-2xl font-bold text-[#3B4540] mb-6">Listing Analytics</h2>
            <ListingStats listings={filteredListings} />
          </>
        )}

        {/* Listings Section */}
        <h1 className="text-3xl font-bold text-[#3B4540] mt-8 mb-6">My Listings</h1>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchSellerListings()}
              className="mt-4 text-[#438951] hover:text-[#4A644E] underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#405449]">
              {selectedCategory === 'all' 
                ? "You haven't created any listings yet."
                : `No listings found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
            <Link
              to="/create-listing"
              className="mt-4 text-[#438951] hover:text-[#4A644E] underline block"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <SellerListingCard 
                key={listing._id} 
                listing={listing}
                onListingUpdate={handleListingUpdate}
              />
            ))}
            {/* Add Listing Card */}
            <div 
              onClick={() => navigate('/create-listing')}
              className="group bg-white bg-opacity-50 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center">
                <div className="rounded-full bg-[#438951] p-4 mx-auto mb-4 group-hover:bg-[#4A644E] transition-colors">
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#3B4540] group-hover:text-[#4A644E]">
                  Add New Listing
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerHomepage;