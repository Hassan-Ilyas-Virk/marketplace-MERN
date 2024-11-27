import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../Components/Navigation.js';
import ListingItem from '../Components/listingItem.js';
import Location from '../Components/location.js';

const categories = [
  { id: 'all', name: 'All Categories', icon: '🔍' },
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

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Temporarily using dummy data instead of API call
        const dummyData = [
          {
            id: 1,
            title: "iPhone 13 Pro Max",
            price: 999.99,
            category: "electro",
            description: "Like new condition, includes original box and accessories",
            image: "https://picsum.photos/400/300",
            location: "New York"
          },
          {
            id: 2,
            title: "Toyota Camry 2020",
            price: 25000,
            category: "vehicles",
            description: "Low mileage, excellent condition, single owner",
            image: "https://picsum.photos/400/300",
            location: "Los Angeles"
          },
          {
            id: 3,
            title: "3 BHK Apartment",
            price: 350000,
            category: "property-sale",
            description: "Spacious apartment with modern amenities",
            image: "https://picsum.photos/400/300",
            location: "Chicago"
          },
          {
            id: 4,
            title: "MacBook Pro 16",
            price: 2199.99,
            category: "electronics",
            description: "M1 Pro, 16GB RAM, 512GB SSD",
            image: "https://picsum.photos/400/300",
            location: "Seattle"
          },
          {
            id: 5,
            title: "Honda CBR 600RR",
            price: 8500,
            category: "bikes",
            description: "2019 model, excellent condition, low miles",
            image: "https://picsum.photos/400/300",
            location: "Miami"
          },
          {
            id: 6,
            title: "Laptop Dell XPS 15",
            price: 1799.99,
            category: "electronics",
            description: "2021 model, 32GB RAM, 1TB SSD",
            image: "https://picsum.photos/400/300",
            location: "Lahore"
          },
          {
            id: 7,
            title: "Toyota Corolla 2019",
            price: 18000,
            category: "vehicles",
            description: "Well maintained, single owner",
            image: "https://picsum.photos/400/300",
            location: "Karachi"
          },
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setListings(dummyData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const filteredListings = listings.filter(listing => {
    let categoryMatch = selectedCategory === 'all' || listing.category === selectedCategory;
    let regionMatch = !selectedRegion || 
      listing.location.toLowerCase().includes(selectedRegion.split(',')[0].toLowerCase());
    let searchMatch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && regionMatch && searchMatch;
  });

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
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
        <Location listings={listings} onLocationFilter={handleRegionSelect} />
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
              <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">
                {category.icon}
              </div>
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
              <ListingItem key={listing.id || index} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center">No listings found</div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
