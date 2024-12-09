import Listing from "../models/Listing.js";
import User from "../models/User.js";

export const getFlaggedItems = async (req, res) => {
  try {
    const flaggedItems = await Listing.find({ isFlagged: true })
      .populate("sellerId", "name")
      .populate("reportedBy", "name")
      .sort({ reportedAt: -1 });

    res.json(flaggedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportAnalytics = async (req, res) => {
  try {
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

    // Get user activity
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Prepare data for graphing
    const graphData = {
      totalSales: totalSales[0]?.total || 0,
      popularCategories,
      userActivity: {
        newUsers,
        activeUsers,
      },
    };

    res.json(graphData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
