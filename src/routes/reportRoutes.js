import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getFlaggedItems,
  getReportAnalytics,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/flagged", protect, isAdmin, getFlaggedItems);
router.get("/analytics", protect, isAdmin, getReportAnalytics);

export default router;
