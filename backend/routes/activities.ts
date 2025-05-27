import express from "express";
import db from "../db";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// 🔓 Recupera tutte le attività disponibili
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const result = await db.query("SELECT * FROM activities ORDER BY name ASC");
    res.json({ activities: result.rows });
  } catch (error) {
    console.error("Errore nel recupero delle attività:", error);
    res.status(500).json({ error: "Errore nel recupero delle attività" });
  }
});

export default router;
