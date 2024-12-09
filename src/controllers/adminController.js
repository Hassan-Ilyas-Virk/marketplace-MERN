import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
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

    // Get total sales
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
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
      Order.find().sort({ createdAt: -1 }).limit(5).populate("buyerId", "name"),
      User.find().sort({ createdAt: -1 }).limit(5).select("name createdAt"),
      Listing.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("sellerId", "name"),
    ]);

    // Calculate monthly growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonthSales = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const lastMonthSales = await Order.countDocuments({
      createdAt: { $gte: lastMonth, $lt: startOfMonth },
    });
    const monthlyGrowth =
      lastMonthSales === 0
        ? 100
        : Math.round(
            ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
          );

    // Get top sellers
    const topSellers = await Order.aggregate([
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

    res.json({
      activeListings,
      newUsers,
      totalSales: totalSales[0]?.total || 0,
      popularCategories,
      recentActivity: recentActivity
        .flat()
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((item) => ({
          description: item.buyerId
            ? `New order by ${item.buyerId.name}`
            : item.sellerId
            ? `New listing by ${item.sellerId.name}`
            : `New user ${item.name} joined`,
          timestamp: item.createdAt,
          type: item.buyerId ? "sale" : item.sellerId ? "listing" : "new_user",
        })),
      monthlyGrowth,
      topSellers,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: "Error getting dashboard stats" });
  }
};
