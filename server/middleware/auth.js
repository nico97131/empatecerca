import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔐 Token decodificado:', decoded);

      const [rows] = await db.execute(
        'SELECT id, name, email, role, dni FROM users WHERE id = ?',
        [decoded.id]
      );
      

      if (rows.length === 0) {
        console.warn('❌ Usuario no encontrado en la base de datos');
        return res.status(401).json({
          success: false,
          message: 'No autorizado, usuario no encontrado'
        });
      }

      req.user = rows[0];
      console.log('✅ Usuario autenticado:', req.user);
      next();
    } catch (error) {
      console.error('❌ Error al verificar token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  } else {
    console.warn('⚠️ Token faltante en encabezado Authorization');
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token faltante'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(`⛔ Rol no autorizado (${req.user.role})`);
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no tiene permiso para acceder a esta ruta`
      });
    }
    console.log(`✅ Acceso autorizado para rol: ${req.user.role}`);
    next();
  };
};
