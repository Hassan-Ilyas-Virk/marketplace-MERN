import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaEye, FaEnvelope } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner.js";

const ListingItem = ({ listing }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/favorites/${listing._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (listing) {
      checkFavoriteStatus();
    }
  }, [listing]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      if (!localStorage.getItem("token")) {
        alert("Please log in to save favorites");
        return;
      }

      const method = isFavorite ? "DELETE" : "POST";

      const response = await fetch("http://localhost:5000/api/favorites", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const responseData = await response.json();
        alert(responseData.message || "Failed to update favorite");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      alert("Error updating favorite");
    }
  };

  const handleContactSeller = async (e) => {
    e.stopPropagation();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        alert("Please log in to contact the seller");
        navigate("/login");
        return;
      }

      console.log("Creating chat with:", {
        customerId: user._id,
        sellerId: listing.sellerId._id,
        token: token,
      });

      const response = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: user._id,
          sellerId: listing.sellerId._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chat creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create chat");
      }

      const chat = await response.json();
      console.log("Created/Retrieved chat:", chat);

      // Navigate to chat page with the chat data
      navigate("/chat", {
        state: {
          chatId: chat._id,
          sellerId: listing.sellerId._id,
        },
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to start chat. Please try again.");
    }
  };

  const handleSellerClick = (e) => {
    e.stopPropagation();
    navigate(`/seller/${listing.sellerId._id}`);
  };

  if (!listing || listing.status !== "Active") return null;
  if (isLoading) return <LoadingSpinner />;

  const { title, description, price, category, images, location, sellerId } =
    listing;

  return (
    <div className="max-w-sm mx-auto shadow-md rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl bg-white animate-fadeIn">
      {/* Image Container */}
      <div className="w-full h-64 overflow-hidden relative group">
        {images && images.length > 0 ? (
          <img
            src={`http://localhost:5000${images[0]}`}
            alt={title}
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
            crossOrigin="anonymous"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
            No image available
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all z-10"
        >
          {isFavorite ? (
            <FaStar className="w-6 h-6 text-yellow-500" />
          ) : (
            <FaRegStar className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-[#557C55]">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">Category: {category}</p>
        <p className="text-sm text-gray-500 mb-2">
          Listed by:{" "}
          <span
            onClick={handleSellerClick}
            className="text-[#557C55] hover:text-[#A6CF98] cursor-pointer"
          >
            {typeof sellerId === "object" ? sellerId.name : "Unknown Seller"}
          </span>
        </p>
        <p className="text-gray-700 text-sm line-clamp-3">{description}</p>
        <p className="text-lg text-[#1DB954] font-semibold mt-2">
          ${typeof price === "number" ? price.toFixed(2) : price}
        </p>
        <p className="text-sm text-gray-500">Location: {location}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <button
          className="flex items-center px-4 py-2 bg-[#557C55] text-white rounded-md hover:bg-[#A6CF98] transition-colors"
          title="View Details"
        >
          <FaEye className="text-lg" />
          <span className="ml-2 text-sm">View</span>
        </button>

        <button
          onClick={handleContactSeller}
          className="flex items-center px-4 py-2 bg-[#1DB954] text-white rounded-md hover:bg-[#1ed760] transition-colors"
          title="Contact Seller"
        >
          <FaEnvelope className="text-lg" />
          <span className="ml-2 text-sm">Contact</span>
        </button>
      </div>
    </div>
  );
};

export default ListingItem;
