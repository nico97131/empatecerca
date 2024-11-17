import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import disciplineRoutes from './routes/discipline.routes.js';
import groupRoutes from './routes/group.routes.js';
import progressRoutes from './routes/progress.routes.js';
import messageRoutes from './routes/message.routes.js';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/messages', messageRoutes);

// Base route for API
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EmpateCerca API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});