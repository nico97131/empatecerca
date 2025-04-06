import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Middleware para proteger rutas con JWT
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario en la base de datos por ID
      const [rows] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado, usuario no encontrado'
        });
      }

      req.user = rows[0]; // Agregamos el usuario al request
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token faltante'
    });
  }
};

// Middleware para validar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no tiene permiso para acceder a esta ruta`
      });
    }
    next();
  };
};
