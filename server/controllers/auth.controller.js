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
  console.log('====================== 📥 POST /api/auth/login ======================');

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('📧 Email:', email);
    console.log('🔑 Password recibida:', password);

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    console.log('📦 Resultado DB (users):', rows);

    if (rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    console.log('✅ Usuario encontrado:', user);

    const isMatch = password === user.password; // TODO: usar bcrypt si lo encriptás
    console.log('🔍 Comparación de contraseña:', isMatch);

    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);
    console.log('✅ Token generado:', token);

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

    console.log('🚀 Login exitoso\n');
  } catch (error) {
    console.error('🔥 Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Privado
export const getMe = async (req, res) => {
  console.log('====================== 👤 GET /api/auth/me ======================');

  try {
    console.log('🔍 Buscando usuario con ID:', req.user.id);

    const [rows] = await db.execute(
      'SELECT id, name, email, role, dni FROM users WHERE id = ?',
      [req.user.id]
    );

    console.log('📦 Resultado DB (users):', rows);

    if (rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];
    console.log('✅ Usuario obtenido correctamente:', user);

    res.json({ success: true, user });
    console.log('📤 Respuesta enviada con éxito\n');
  } catch (error) {
    console.error('🔥 Error en getMe:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Privado
export const updatePassword = async (req, res) => {
  console.log('====================== 🔒 PUT /api/auth/updatepassword ======================');

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    console.log('🔑 Password actual:', currentPassword);
    console.log('🔐 Nueva password:', newPassword);

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    console.log('📦 Resultado DB (users):', rows);

    if (rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('🔍 Comparación de contraseña actual:', isMatch);

    if (!isMatch) {
      console.log('❌ Contraseña actual incorrecta');
      return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 Password nueva hasheada correctamente');

    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    console.log('✅ Contraseña actualizada en la base de datos');

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    console.log('📤 Respuesta enviada con éxito\n');
  } catch (error) {
    console.error('🔥 Error en updatePassword:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
