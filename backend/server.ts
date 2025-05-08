import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth'; // Assicurati che il percorso sia corretto

const app = express();
const PORT = 3001;

app.use(cors()); // Se usi frontend separato, cors è necessario
app.use(express.json());

app.use('/api', authRoutes); // 💥 monta le rotte /api/register e /api/login

// ✅ Aggiunta route di base per evitare "Cannot GET /"
app.get('/', (req, res) => {
  res.send('🟢 Backend WoopIt attivo!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
