import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Público
export const login = async (req, res) => {
  try {
    console.log('📥 Solicitud recibida en /login');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('🔐 Email recibido:', email);
    console.log('🔐 Password recibido:', password);

    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      console.log('❌ Usuario no encontrado con ese email');
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    console.log('✅ Usuario encontrado en DB:', user);

    const isMatch = password === user.password;
    console.log('🔍 Comparación de contraseña:', isMatch);

    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);
    console.log('✅ Login exitoso, token generado');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dni: user.dni
      }
    });
  } catch (error) {
    console.error('❌ Error en /login:', error.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};


// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Privado
export const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, dni FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Privado
export const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
