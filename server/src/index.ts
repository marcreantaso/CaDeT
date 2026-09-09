import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRoutes } from './routes/ai.routes';
import { careerRoutes } from './routes/career.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cadet-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/career', careerRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 CaDeT API running on http://localhost:${PORT}`);
});

export default app;
