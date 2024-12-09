import React from "react";
import { motion } from "framer-motion";
import {
  FaListAlt,
  FaCheckCircle,
  FaHandshake,
  FaClock,
  FaEye,
} from "react-icons/fa";

const StatCard = ({ title, value, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-[#1DB954]/10 rounded-lg">
        <Icon className="w-6 h-6 text-[#1DB954]" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#3B4540]">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const ListingStats = ({ listings }) => {
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === "Active").length;
  const soldListings = listings.filter((l) => l.status === "Sold").length;
  const pendingListings = listings.filter((l) => l.status === "Pending").length;
  const totalViews = listings.reduce(
    (sum, listing) => sum + (listing.views || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Listings"
        value={totalListings}
        icon={FaListAlt}
        delay={0.1}
      />
      <StatCard
        title="Active"
        value={activeListings}
        icon={FaCheckCircle}
        delay={0.2}
      />
      <StatCard
        title="Sold"
        value={soldListings}
        icon={FaHandshake}
        delay={0.3}
      />
      <StatCard
        title="Pending"
        value={pendingListings}
        icon={FaClock}
        delay={0.4}
      />
      <StatCard
        title="Total Views"
        value={totalViews}
        icon={FaEye}
        delay={0.5}
      />
    </div>
  );
};

export default ListingStats;
