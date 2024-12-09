import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "../Components/Navigation.js";
import SellerListingCard from "../Components/SellerListingCard.js";
import ListingStats from "../Components/ListingStats.js";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import sellingGif from "../media/selling.gif";
import SearchBar from "../Components/SearchBar.js";

const categories = [
  { id: "all", name: "All Listings", icon: "📋" },
  { id: "vehicles", name: "Vehicles", icon: "🚗" },
  { id: "property-sale", name: "Property For Sale", icon: "🏠" },
  { id: "property-rent", name: "Property For Rent", icon: "🔑" },
  { id: "electronics", name: "Electronics & Home Appliances", icon: "📷" },
  { id: "business", name: "Business, Industrial & Agriculture", icon: "🚜" },
  { id: "services", name: "Services", icon: "🔧" },
];

const SellerHomepage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSellerListings = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/listings/seller",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "Seller") {
      fetchSellerListings();
    }
  }, []);

  const handleListingUpdate = async (updatedListing) => {
    if (!updatedListing) {
      // If null, it means the listing was deleted
      await fetchSellerListings();
    } else {
      // Update the specific listing in the listings array
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing._id === updatedListing._id ? updatedListing : listing
        )
      );
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredListings = listings.filter((listing) => {
    const categoryMatch =
      selectedCategory === "all" || listing.category === selectedCategory;
    const searchMatch =
      !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Redirect if not logged in or not a seller
  if (!user || user.role !== "Seller") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Main Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl overflow-hidden relative group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Base Image */}
            <img
              src={sellingGif}
              alt="Selling Animation"
              className="w-full h-[300px] object-cover"
            />

            {/* Text Overlay */}
            <div
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                flex items-center justify-center transition-all duration-300"
            >
              <h1
                className="text-4xl font-bold text-white transform translate-y-4 
                  group-hover:translate-y-0 transition-transform duration-300"
              >
                Seller's Home Page
              </h1>
            </div>
          </motion.div>
        </motion.div>

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-[#3B4540] mb-6">
            Filter by category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl h-full
                  transition-all duration-300 shadow-sm hover:shadow-md
                  ${
                    selectedCategory === category.id
                      ? "bg-[#1DB954] text-white transform scale-105"
                      : "bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-[#1DB954]"
                  }
                `}
              >
                <div
                  className={`
                  w-12 h-12 flex items-center justify-center text-2xl mb-2 rounded-lg
                  ${
                    selectedCategory === category.id
                      ? "bg-white/20"
                      : "bg-[#1DB954]/10"
                  }
                `}
                >
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-center break-words w-full px-1 line-clamp-2">
                  {category.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Analytics Section */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#3B4540] mb-6">
              Listing Analytics
            </h2>
            <ListingStats listings={filteredListings} />
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <SearchBar searchQuery={searchQuery} handleSearch={handleSearch} />
        </motion.div>

        {/* Listings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-[#3B4540] mt-8 mb-6">
            My Listings
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <motion.div
              className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-red-500">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchSellerListings()}
                className="mt-4 text-[#1DB954] hover:text-[#3B4540] underline"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : filteredListings.length === 0 ? (
            <motion.div
              className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-[#3B4540]">
                {selectedCategory === "all"
                  ? "You haven't created any listings yet."
                  : `No listings found in the ${
                      categories.find((c) => c.id === selectedCategory)?.name
                    } category.`}
              </p>
              <Link
                to="/create-listing"
                className="mt-4 text-[#1DB954] hover:text-[#3B4540] underline block"
              >
                Create your first listing
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <SellerListingCard
                      listing={listing}
                      onListingUpdate={handleListingUpdate}
                    />
                  </motion.div>
                ))}
                {/* Add Listing Card */}
                <motion.div
                  onClick={() => navigate("/create-listing")}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden 
                    transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center 
                    justify-center min-h-[300px]"
                >
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="rounded-full bg-[#1DB954] p-4 mx-auto mb-4 hover:bg-[#3B4540] transition-colors"
                    >
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
                    </motion.div>
                    <h3 className="text-lg font-semibold text-[#3B4540] hover:text-[#1DB954]">
                      Add New Listing
                    </h3>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(SellerHomepage);
