import React from 'react';
import Location from './location.js';

const FilterBox = ({ 
  sortBy, 
  setSortBy, 
  priceRange, 
  setPriceRange, 
  listings,
  selectedRegion,
  locationData,
  handleRegionSelect,
  getCurrentLocation 
}) => {
  return (
    <div className="w-full md:w-1/4 relative z-10 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-4 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <h3 className="text-xl font-semibold text-[#1DB954] mb-6">Filters</h3>
        
        {/* Sort Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DB954] bg-white transition-all duration-300 hover:border-[#1DB954]"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ 
                ...prev, 
                min: e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
              }))}
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DB954] bg-white transition-all duration-300 hover:border-[#1DB954]"
            />
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({
                ...prev,
                max: e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
              }))}
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DB954] bg-white transition-all duration-300 hover:border-[#1DB954]"
            />
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="w-full">
            <Location 
              listings={listings} 
              onLocationFilter={handleRegionSelect}
              selectedLocation={selectedRegion}
              locationData={locationData}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DB954] bg-white transition-all duration-300 hover:border-[#1DB954]"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={getCurrentLocation}
              className="w-full px-4 py-3 bg-[#1DB954] text-white rounded-xl hover:bg-[#1ed760] transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>📍</span>
              <span>Get Current Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBox;
