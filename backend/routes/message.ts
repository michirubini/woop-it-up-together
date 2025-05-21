import express from "express";
import { saveMessage, getMessages } from "../api/messages";
import { authenticateToken as authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { woop_id, user_id, text } = req.body;
  if (!woop_id || !user_id || !text) {
    return res.status(400).json({ error: 'woop_id, user_id e text sono richiesti' });
  }
  try {
    await saveMessage(woop_id, user_id, text);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('❌ Errore salvataggio messaggio:', error);
    res.status(500).json({ error: 'Errore salvataggio messaggio' });
  }
});

router.get("/:woop_id", authMiddleware, async (req, res) => {
  const woop_id = parseInt(req.params.woop_id);
  if (isNaN(woop_id)) {
    return res.status(400).json({ error: 'woop_id deve essere un numero' });
  }
  try {
    const messages = await getMessages(woop_id);
    res.json(messages);
  } catch (error) {
    console.error('❌ Errore recupero messaggi:', error);
    res.status(500).json({ error: 'Errore recupero messaggi' });
  }
});

export default router;

