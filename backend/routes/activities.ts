import express from "express";
import db from "../db";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// 🔓 Recupera tutte le attività disponibili (con prima lettera maiuscola)
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const result = await db.query("SELECT name FROM activities ORDER BY name ASC");

    const activities = result.rows.map(row => ({
      name: row.name.charAt(0).toUpperCase() + row.name.slice(1)
    }));

    res.json({ activities });
  } catch (error) {
    console.error("Errore nel recupero delle attività:", error);
    res.status(500).json({ error: "Errore nel recupero delle attività" });
  }
});

export default router;

