import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import ListingItem from '../Components/listingItem.js';
import Location from '../Components/location.js';
import ListingDetailModal from '../Components/ListingDetailModal.js';
import AIChatbot from '../Components/AIchatbot.js';

const categories = [
  { id: 'favorites', name: 'Favorites', icon: '💝' },
  { id: 'all', name: 'All Categories', icon: '🎯' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'property-sale', name: 'Property For Sale', icon: '🏠' },
  { id: 'property-rent', name: 'Property For Rent', icon: '🔑' },
  { id: 'electronics', name: 'Electronics & Home Appliances', icon: '📷' },
  { id: 'business', name: 'Business, Industrial & Agriculture', icon: '🚜' },
  { id: 'services', name: 'Services', icon: '🔧' }
];

const Homepage = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/listings');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchListings();
    fetchFavorites();
  }, [user.token]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const filteredListings = listings.filter((listing) => {
    const categoryMatch =
      selectedCategory === 'all' ||
      (selectedCategory === 'favorites'
        ? favorites.some((fav) => fav._id === listing._id)
        : listing.category === selectedCategory);
    const regionMatch = !selectedRegion || listing.location.toLowerCase().includes(selectedRegion.toLowerCase());
    const searchMatch =
      !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = listing.status === 'Active';
    return categoryMatch && regionMatch && searchMatch && statusMatch;
  });

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const getCurrentLocation = () => {
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const locationString = data.city || data.locality || data.principalSubdivision;
            const locationData = {
              value: `${locationString}, ${data.countryName}`,
              label: `${locationString}, ${data.countryName}`
            };
            setSelectedRegion(locationString);
            setLocationData(locationData);
            setError(null);
          } catch (error) {
            console.error('Error getting location details:', error);
    
          }
        },
        (error) => {
          console.error('Error getting location:', error);
      
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const toggleFavorite = async (listingId) => {
    try {
      const updatedFavorites = favorites.includes(listingId)
        ? favorites.filter((id) => id !== listingId)
        : [...favorites, listingId];

      setFavorites(updatedFavorites);

      await fetch(`http://localhost:5000/api/favorites/${listingId}`, {
        method: favorites.includes(listingId) ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Top Search Bar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
       
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Location Filter */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 items-center">
          <Location 
            listings={listings} 
            onLocationFilter={handleRegionSelect}
            selectedLocation={selectedRegion}
            locationData={locationData}
          />
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            📍
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">{category.icon}</div>
              <span className="text-sm text-center text-gray-700">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {selectedRegion ? `Listings in ${selectedRegion}` : 'Featured Items'}
        </h1>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <div key={listing.id || index} onClick={() => handleListingClick(listing)}>
                <ListingItem
                  listing={listing}
                  isFavorite={favorites.includes(listing._id)}
                  onToggleFavorite={() => toggleFavorite(listing._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">No listings found</div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {isModalOpen && <ListingDetailModal listing={selectedListing} onClose={closeModal} />}
      
      {/* Add the chatbot component at the end */}
      <AIChatbot />
    </div>
  );
};

export default Homepage;
