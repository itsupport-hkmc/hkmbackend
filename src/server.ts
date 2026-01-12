import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import icvkRoutes from './routes/icvkRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_ID = Date.now(); // Unique ID for this run

// 1. Logger FIRST (to catch everything)
app.use((req, res, next) => {
  process.stdout.write(`[${new Date().toISOString()}] ${req.method} ${req.url} | ServerID: ${SERVER_ID}\n`);
  next();
});

app.use(cors());
app.use(express.json());

// 2. Simple Ping Route for verification
app.get('/ping', (req, res) => res.send(`Pong! Server ID: ${SERVER_ID}`));

app.use('/api/icvk', icvkRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('🔥 [Global Error Error] Uncaught Exception:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message || 'Unknown Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.get('/', (req, res) => {
  process.stdout.write('🟢 [Route /] Request received!\n');
  res.send('API is running');
});


const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      process.stdout.write(`✅ Server running on port : ${PORT} | Instance ID: ${SERVER_ID}\n`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error);
    process.exit(1);
  }
};

startServer();
