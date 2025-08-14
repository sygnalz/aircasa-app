// src/routes/properties.js
import { Router } from "express";
const router = Router();

/**
 * GET /properties
 * Protected by requireAuth
 * Currently returns an empty list (schema-agnostic).
 */
router.get("/", async (_req, res) => {
  try {
    const items = []; // TODO: replace with real data source (Supabase/Airtable)
    res.json({ items });
  } catch (err) {
    console.error("GET /properties failed:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

export default router;
