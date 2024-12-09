import { Navigate } from "react-router-dom";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Basic route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  // Add dashboard stats functionality
  const getDashboardStats = async () => {
    try {
      // Get active listings count
      const activeListings = await Listing.countDocuments({ status: "Active" });

      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      // Get total sales from completed listings
      const totalSales = await Listing.aggregate([
        { $match: { status: "Sold" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]);

      // Get popular categories
      const popularCategories = await Listing.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { name: "$_id", count: 1, _id: 0 } },
      ]);

      // Get recent activity
      const recentActivity = await Promise.all([
        Listing.find({ status: "Sold" })
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate("sellerId", "name"),
        User.find().sort({ createdAt: -1 }).limit(5).select("name createdAt"),
        Listing.find({ status: "Active" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("sellerId", "name"),
      ]);

      // Calculate monthly growth using sold listings
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const thisMonthSales = await Listing.countDocuments({
        status: "Sold",
        updatedAt: { $gte: startOfMonth },
      });
      const lastMonthSales = await Listing.countDocuments({
        status: "Sold",
        updatedAt: { $gte: lastMonth, $lt: startOfMonth },
      });
      const monthlyGrowth =
        lastMonthSales === 0
          ? 100
          : Math.round(
              ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
            );

      // Get top sellers based on sold listings
      const topSellers = await Listing.aggregate([
        { $match: { status: "Sold" } },
        { $group: { _id: "$sellerId", totalSales: { $sum: 1 } } },
        { $sort: { totalSales: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "sellerInfo",
          },
        },
        { $unwind: "$sellerInfo" },
        {
          $project: {
            name: "$sellerInfo.name",
            profilePicture: "$sellerInfo.profilePicture",
            totalSales: 1,
          },
        },
      ]);

      return {
        activeListings,
        newUsers,
        totalSales: totalSales[0]?.total || 0,
        popularCategories,
        recentActivity: recentActivity
          .flat()
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
          .map((item) => ({
            description:
              item.status === "Sold"
                ? `Item sold by ${item.sellerId.name}`
                : item.sellerId
                ? `New listing by ${item.sellerId.name}`
                : `New user ${item.name} joined`,
            timestamp: item.createdAt || item.updatedAt,
            type:
              item.status === "Sold"
                ? "sale"
                : item.sellerId
                ? "listing"
                : "new_user",
          })),
        monthlyGrowth,
        topSellers,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return null;
    }
  };

  return children;
};

export default AdminRoute;
