import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from './config/db.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import disciplineRoutes from './routes/discipline.routes.js';
import groupRoutes from './routes/group.routes.js';
import progressRoutes from './routes/progress.routes.js';
import messageRoutes from './routes/message.routes.js';
import studentRoutes from './routes/student.routes.js';
import tutorsRoutes from './routes/tutor.routes.js';

// Cargar variables de entorno
dotenv.config();
const PORT = process.env.PORT || 5001;
console.log('🔐 .env cargado - Puerto:', PORT);

const startServer = async () => {
  // Verificar conexión a MySQL
  try {
    await db.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    process.exit(1);
  }

  const app = express();

  // Middlewares globales
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rutas de API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/volunteers', volunteerRoutes);
  app.use('/api/disciplines', disciplineRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/tutors', tutorsRoutes);

  // Ruta base
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to EmpateCerca API' });
  });

  // Middleware para rutas no encontradas
  app.use((req, res) => {
    console.warn(`⚠️ Ruta no encontrada: ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  });

  // Middleware para errores generales
  app.use((err, req, res, next) => {
    console.error('🔥 Error en ejecución:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
