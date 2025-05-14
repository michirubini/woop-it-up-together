import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import matchRequestsRoutes from "./routes/matchRequests";
import { saveMessage, getMessages } from './api/messages';
import { joinWoop, getParticipants } from './api/participants';
import { completeWoop, leaveWoop, createWoopInDb } from './api/woops';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matchrequests', matchRequestsRoutes);

// ✅ Crea un nuovo Woop
app.post('/api/woops/create', async (req, res) => {
  const { title, description, user_id, preferences } = req.body;

  if (!title || !description || !user_id) {
    return res.status(400).json({ error: 'title, description e user_id sono richiesti' });
  }

  try {
    const woopId = await createWoopInDb(title, description, user_id, preferences);
    res.status(201).json({ success: true, woop_id: woopId });
  } catch (error) {
    console.error('❌ Errore creazione Woop:', error);
    res.status(500).json({ error: 'Errore creazione Woop' });
  }
});

// ✅ Partecipazione a un Woop
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

// ✅ Uscita da un Woop
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

// ✅ Completa un Woop
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

// ✅ Recupera partecipanti
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

// ✅ Messaggi
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

