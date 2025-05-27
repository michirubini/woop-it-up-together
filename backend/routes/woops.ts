import { Router } from "express";
import db from "../db";
import {
  getAllWoops,
  createWoopInDb,
  completeWoop,
  leaveWoop,
  deleteWoop
} from "../api/woops";

const router = Router();

// ✅ GET /api/woops - Recupera tutti i Woop reali (con partecipanti + messaggi)
router.get("/", async (_req, res) => {
  try {
    const woops = await getAllWoops();
    res.status(200).json({ woops });
  } catch (err) {
    console.error("❌ Errore recupero Woops:", err);
    res.status(500).json({ error: "Errore nel recupero dei Woops" });
  }
});

// ✅ POST /api/woops/create - Crea un nuovo Woop reale
router.post("/create", async (req, res) => {
  const { title, description, user_id, preferences } = req.body;

  if (!title || !description || !user_id || !preferences) {
    return res.status(400).json({ error: "Dati incompleti" });
  }

  try {
    const woopId = await createWoopInDb(title, description, user_id, preferences);
    res.status(201).json({ woop_id: woopId });
  } catch (err) {
    console.error("❌ Errore creazione Woop:", err);
    res.status(400).json({ error: "Errore durante la creazione del Woop" });
  }
});

// ✅ POST /api/woops/complete - Segna un Woop come completato
router.post("/complete", async (req, res) => {
  const { woop_id } = req.body;
  if (!woop_id) return res.status(400).json({ error: "woop_id mancante" });

  try {
    await completeWoop(woop_id);
    res.status(200).json({ message: "Woop completato" });
  } catch (err) {
    console.error("❌ Errore completamento Woop:", err);
    res.status(500).json({ error: "Errore completamento Woop" });
  }
});

// ✅ POST /api/woops/leave - Esce da un Woop
router.post("/leave", async (req, res) => {
  const { woop_id, user_id } = req.body;
  if (!woop_id || !user_id) return res.status(400).json({ error: "woop_id e user_id richiesti" });

  try {
    await leaveWoop(woop_id, user_id);
    res.status(200).json({ message: "Uscito dal Woop" });
  } catch (err) {
    console.error("❌ Errore uscita Woop:", err);
    res.status(500).json({ error: "Errore uscita Woop" });
  }
});

// ✅ POST /api/woops/delete - Elimina un Woop
router.post("/delete", async (req, res) => {
  const { woop_id } = req.body;
  if (!woop_id) return res.status(400).json({ error: "woop_id richiesto" });

  try {
    await deleteWoop(woop_id);
    res.status(200).json({ message: "Woop eliminato con successo" });
  } catch (err) {
    console.error("❌ Errore eliminazione Woop:", err);
    res.status(500).json({ error: "Errore eliminazione Woop" });
  }
});

export default router;

