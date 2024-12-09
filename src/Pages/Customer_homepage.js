import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import HomeSlideshow from '../Components/HomeSlideshow.js';
import ListingItem from '../Components/listingItem.js';
import Location from '../Components/location.js';
import ListingDetailModal from '../Components/ListingDetailModal.js';
import AIChatbot from '../Components/AIchatbot.js';
import FilterBox from '../Components/FilterBox.js';
import LoadingSpinner from '../Components/LoadingSpinner.js';
import { motion } from 'framer-motion';
import SearchBar from '../Components/SearchBar.js';

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
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
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
            setFavorites(data.map(listing => listing._id));
          } catch (error) {
            console.error('Error fetching favorites:', error);
            setFavorites([]);
          }
        };

        await fetchListings();
        await fetchFavorites();
        
        // Simulate loading for demo
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    initializePage();
  }, [user.token]);

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredListings = listings.filter((listing) => {
    if (selectedCategory === 'favorites') {
      return favorites.includes(listing._id) && listing.status === 'Active';
    }

    const categoryMatch =
      selectedCategory === 'all' ||
      listing.category === selectedCategory;
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

      const response = await fetch('http://localhost:5000/api/favorites', {
        method: favorites.includes(listingId) ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId })
      });

      if (!response.ok) {
        setFavorites(favorites);
        throw new Error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const sortListings = (listings) => {
    switch (sortBy) {
      case 'price-asc':
        return [...listings].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...listings].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...listings].sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return [...listings].sort((a, b) => b.title.localeCompare(a.title));
      default:
        return listings;
    }
  };

  const applyPriceFilter = (listings) => {
    return listings.filter(listing => {
      if (priceRange.min && priceRange.max) {
        return listing.price >= Number(priceRange.min) && listing.price <= Number(priceRange.max);
      }
      return true;
    });
  };

  const finalListings = sortListings(applyPriceFilter(filteredListings));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white"
    >
      <Navigation />
      
      {/* Animated container for slideshow and search */}
      <div className="animate-slideDown">
        <HomeSlideshow />
        
        {/* Enhanced Search Section */}
        <SearchBar 
          searchQuery={searchQuery}
          handleSearch={handleSearch}
        />
      </div>

      {/* Rest of your content */}
      <div className="animate-fadeIn">
        <div className="max-w-full mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <FilterBox 
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              listings={listings}
              selectedRegion={selectedRegion}
              locationData={locationData}
              handleRegionSelect={handleRegionSelect}
              getCurrentLocation={getCurrentLocation}
            />

            <div className="w-full md:w-3/4">
              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center p-4 rounded-lg transition-all transform hover:scale-105
                      ${selectedCategory === category.id 
                        ? 'bg-[#1DB954] text-white shadow-md' 
                        : 'bg-white hover:bg-[#A6CF98] hover:bg-opacity-20 border border-[#A6CF98]'
                      }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">
                      {category.icon}
                    </div>
                    <span className="text-sm text-center">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Listings Grid */}
              {loading ? (
                <div className="text-center py-8 text-[#557C55]">Loading...</div>
              ) : finalListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {finalListings.map((listing, index) => (
                    <div 
                      key={listing.id || index} 
                      onClick={() => handleListingClick(listing)}
                      className="transform transition-all duration-300 hover:-translate-y-1"
                    >
                      <ListingItem
                        listing={listing}
                        isFavorite={Array.isArray(favorites) && favorites.includes(listing._id)}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          toggleFavorite(listing._id);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#557C55]">No listings found</div>
              )}
            </div>
          </div>
        </div>

        {isModalOpen && <ListingDetailModal listing={selectedListing} onClose={closeModal} />}
        <AIChatbot />
      </div>
    </motion.div>
  );
};

export default Homepage;
