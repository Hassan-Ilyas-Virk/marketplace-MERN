import React from 'react';
import { motion } from 'framer-motion';

const SearchBar = ({ searchQuery, handleSearch }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative -mt-8">
      <motion.div 
        className="bg-white rounded-full shadow-2xl transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for items..."
            className="w-full px-8 py-6 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-all duration-300 pl-14"
            value={searchQuery}
            onChange={handleSearch}
          />
          {/* Search Icon */}
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchBar; 