import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users'; // ✅ nuova importazione

const app = express();
const PORT = 3001;

app.use(cors()); // Se usi frontend separato, cors è necessario
app.use(express.json());

app.use('/api', authRoutes);       // 💥 /api/register e /api/login
app.use('/api/users', userRoutes); // ✅ /api/users (GET utenti)

// ✅ Aggiunta route di base per evitare "Cannot GET /"
app.get('/', (_req, res) => {
  res.send('🟢 Backend WoopIt attivo!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
