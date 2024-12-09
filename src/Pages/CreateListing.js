import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "../Components/Navigation.js";
import Location from "../Components/location.js";
import LoadingSpinner from "../Components/LoadingSpinner.js";
import AIChatbot from "../Components/AIchatbot.js";

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    condition: "new",
  });
  const [locationValue, setLocationValue] = useState("");

  // Categories with their icons and condition applicability
  const categories = [
    { value: "vehicles", label: "Vehicles", icon: "🚗", hasCondition: true },
    {
      value: "property-sale",
      label: "Property For Sale",
      icon: "🏠",
      hasCondition: false,
    },
    {
      value: "property-rent",
      label: "Property For Rent",
      icon: "🏢",
      hasCondition: false,
    },
    {
      value: "electronics",
      label: "Electronics",
      icon: "💻",
      hasCondition: true,
    },
    { value: "business", label: "Business", icon: "💼", hasCondition: false },
    { value: "services", label: "Services", icon: "🔧", hasCondition: false },
  ];

  // Check if selected category should show condition
  const shouldShowCondition = () => {
    const selectedCategory = categories.find(
      (cat) => cat.value === formData.category
    );
    return selectedCategory?.hasCondition || false;
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const listingFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      listingFormData.append(key, formData[key]);
    });
    images.forEach((image) => {
      listingFormData.append("images", image);
    });

    try {
      const response = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: listingFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create listing");
      }

      navigate("/seller");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          // Format the location string to include city and country
          const city =
            data.address.city || data.address.town || data.address.village;
          const country = data.address.country;
          const locationString = `${city}, ${country}`;

          // Update both states
          setLocationValue(locationString);
          setFormData((prev) => ({ ...prev, location: locationString }));
        } catch (error) {
          console.error("Error fetching location data:", error);
          alert("Error fetching location data. Please try again.");
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        if (error.code === 1) {
          alert("Please enable location access in your browser settings.");
        } else if (error.code === 2) {
          alert("Location unavailable. Please try again.");
        } else {
          alert("Error getting location. Please try again.");
        }
      }
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white">
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-[#3B4540] mb-8">
            Create New Listing
          </h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-md shadow-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Cards */}
            <motion.div layout>
              <label className="block text-sm font-medium text-[#3B4540] mb-4">
                Select Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat, index) => (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: cat.value })
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-300 shadow-sm
                      ${
                        formData.category === cat.value
                          ? "border-[#1DB954] bg-[#1DB954]/10 shadow-md"
                          : "border-[#D1E7D2] hover:border-[#1DB954] bg-white/50"
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium text-[#3B4540]">
                      {cat.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Form Fields */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Title */}
              <div className="group">
                <label className="block text-sm font-medium text-[#3B4540] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#D1E7D2] rounded-xl 
                    focus:ring-[#1DB954] focus:border-[#1DB954] transition-all duration-300
                    bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                  placeholder="Enter listing title"
                />
              </div>

              {/* Location with Geolocation Button */}
              <div>
                <label className="block text-sm font-medium text-[#3B4540] mb-2">
                  Location
                </label>
                <div className="space-y-2">
                  <Location
                    onLocationFilter={handleLocationSelect}
                    selectedLocation={locationValue || formData.location}
                    className="w-full p-3 border border-[#D1E7D2] rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-[#1DB954] 
                      bg-white/50 backdrop-blur-sm transition-all duration-300 
                      hover:border-[#1DB954]"
                  />
                  <motion.button
                    type="button"
                    onClick={getCurrentLocation}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-[#1DB954] text-white rounded-xl 
                      hover:bg-[#1ed760] transition-all duration-300 
                      hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>📍</span>
                    <span>Get Current Location</span>
                  </motion.button>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[#3B4540] mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#405449]">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full pl-8 pr-4 py-2 border border-[#D1E7D2] rounded-md focus:ring-[#438951] focus:border-[#438951]"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Condition - Only shown for applicable categories */}
              {shouldShowCondition() && (
                <div>
                  <label className="block text-sm font-medium text-[#3B4540] mb-2">
                    Condition
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, condition: "new" })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.condition === "new"
                          ? "border-[#438951] bg-[#DFEEE2]"
                          : "border-[#D1E7D2] hover:border-[#438951]"
                      }`}
                    >
                      <div className="text-xl mb-1">✨</div>
                      <div className="font-medium text-[#3B4540]">New</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, condition: "used" })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.condition === "used"
                          ? "border-[#438951] bg-[#DFEEE2]"
                          : "border-[#D1E7D2] hover:border-[#438951]"
                      }`}
                    >
                      <div className="text-xl mb-1">👍</div>
                      <div className="font-medium text-[#3B4540]">Used</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#3B4540] mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-[#D1E7D2] rounded-md focus:ring-[#438951] focus:border-[#438951]"
                  placeholder="Describe your item..."
                />
              </div>

              {/* Images */}
              <motion.div layout>
                <label className="block text-sm font-medium text-[#3B4540] mb-2">
                  Images
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 
                    border-[#D1E7D2] border-dashed rounded-xl bg-white/50 
                    backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-[#405449]"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-[#405449]">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#438951] hover:text-[#4A644E] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#438951]">
                        <span>Upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-[#405449]">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </motion.div>

                {/* Image Previews */}
                <AnimatePresence>
                  {previewUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4 grid grid-cols-3 gap-4"
                    >
                      {previewUrls.map((url, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          className="relative rounded-xl overflow-hidden shadow-md"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-24 object-cover"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white 
                              rounded-full p-1 hover:bg-red-600 shadow-lg"
                          >
                            ×
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="pt-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <button
                  type="submit"
                  disabled={loading || !formData.category}
                  className="w-full px-4 py-3 bg-[#1DB954] text-white rounded-xl
                    hover:bg-[#15a043] focus:outline-none focus:ring-2 
                    focus:ring-[#1DB954] focus:ring-offset-2 disabled:opacity-50 
                    transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  {loading ? <LoadingSpinner /> : "Create Listing"}
                </button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      <AIChatbot />
    </div>
  );
};

export default CreateListing;
