/// <reference path="./types/express/index.d.ts" />

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { saveMessage, getMessages } from './api/messages';
import { completeWoop } from './api/woops';
import { joinWoop, getParticipants } from './api/participants';
import matchRequestsRoutes from "./routes/matchRequests";
import { leaveWoop } from './api/woops';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/matchrequests", matchRequestsRoutes);

app.post('/api/participants', async (req, res) => {
  const { woop_id, user_id } = req.body;

  if (!woop_id || !user_id) {
    return res.status(400).json({ error: 'woop_id e user_id sono richiesti' });
  }

  try {
    await joinWoop(woop_id, user_id);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('❌ Errore salvataggio partecipazione:', error);
    res.status(500).json({ error: 'Errore salvataggio partecipazione' });
  }
});
app.post('/api/woops/leave', async (req, res) => {
  const { woop_id, user_id } = req.body;

  if (!woop_id || !user_id) {
    return res.status(400).json({ error: "woop_id e user_id sono richiesti" });
  }

  try {
    await leaveWoop(woop_id, user_id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Errore uscita Woop:", err);
    res.status(500).json({ error: "Errore durante l'uscita dal Woop" });
  }
});

app.get('/api/participants/:woop_id', async (req, res) => {
  const woop_id = parseInt(req.params.woop_id);

  if (isNaN(woop_id)) {
    return res.status(400).json({ error: 'woop_id deve essere un numero' });
  }

  try {
    const participants = await getParticipants(woop_id);
    res.json(participants);
  } catch (error) {
    console.error('❌ Errore recupero partecipanti:', error);
    res.status(500).json({ error: 'Errore recupero partecipanti' });
  }
});

app.post('/api/messages', async (req, res) => {
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

app.post('/api/woops/complete', async (req, res) => {
  const { woop_id } = req.body;

  if (!woop_id) {
    return res.status(400).json({ error: 'woop_id è richiesto' });
  }

  try {
    await completeWoop(woop_id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Errore completamento Woop:', error);
    res.status(500).json({ error: 'Errore nel completamento Woop' });
  }
});

app.get('/api/messages/:woop_id', async (req, res) => {
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

app.get('/', (_req, res) => {
  res.send('🟢 Backend WoopIt attivo!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
