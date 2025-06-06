// src/controllers/usersController.js

import db from '../config/db.js';

// @desc    Obtener todos los usuarios (tutores y voluntarios) desde users2
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  console.log('==================== 📥 GET /api/users ====================');

  try {
    const [users] = await db.execute(
      `
      SELECT
        COALESCE(tutor_id, volunteer_id) AS id,
        name,
        email,
        dni,
        role,
        status,
        lastLogin
      FROM users2
      `
    );

    console.log('✅ Usuarios obtenidos:', users.length);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ [getUsers] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// @desc    Obtener usuario (tutor o voluntario) por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`==================== 📥 GET /api/users/${userId} ====================`);

  try {
    const [rows] = await db.execute(
      `
      SELECT
        COALESCE(tutor_id, volunteer_id) AS id,
        name,
        email,
        dni,
        role,
        status,
        lastLogin
      FROM users2
      WHERE tutor_id = ? OR volunteer_id = ?
      `,
      [userId, userId]
    );

    console.log('📦 Resultado DB (getUser):', rows);

    const user = rows[0];
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario encontrado:', user);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ [getUser] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario'
    });
  }
};

// @desc    Crear un nuevo usuario (tutor o voluntario) en users2
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  console.log('==================== 🛠️ POST /api/users ====================');
  console.log('📥 Datos recibidos:', req.body);

  const { name, email, password, dni, role, status } = req.body;
  if (!name || !email || !password || !dni || !role) {
    console.log('❌ Faltan campos obligatorios');
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
    });
  }

  try {
    // Insertar en users2; Tutor o Voluntario se define por campo `role`
    // MySQL llenará tutor_id o volunteer_id automáticamente según role
    const [result] = await db.execute(
      `
      INSERT INTO users2
        (name, email, password, dni, role, status)
      VALUES
        (?, ?, ?, ?, ?, ?)
      `,
      [name, email, password, dni, role, status || 'active']
    );

    // Luego, recuperar el registro recién creado. 
    // Como no sabemos si fue tutor_id o volunteer_id, usamos COALESCE para coincidir con el ultimo insertId.
    const newId = result.insertId;
    const [newUserRows] = await db.execute(
      `
      SELECT
        COALESCE(tutor_id, volunteer_id) AS id,
        name,
        email,
        dni,
        role,
        status,
        lastLogin
      FROM users2
      WHERE tutor_id = ? OR volunteer_id = ?
      `,
      [newId, newId]
    );

    const newUser = newUserRows[0];
    console.log('📦 Usuario creado:', newUser);

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('❌ [createUser] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario'
    });
  }
};

// @desc    Actualizar usuario (tutor o voluntario) en users2
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`==================== ✏️ PUT /api/users/${userId} ====================`);
  console.log('📥 Datos recibidos para actualizar:', req.body);

  const { name, email, role, status, dni } = req.body;

  try {
    const [result] = await db.execute(
      `
      UPDATE users2
         SET name = ?,
             email = ?,
             dni = ?,
             role = ?,
             status = ?
       WHERE tutor_id = ? OR volunteer_id = ?
      `,
      [name, email, dni, role, status, userId, userId]
    );

    console.log('🔁 Resultado de actualización:', result);

    if (result.affectedRows === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const [updatedRows] = await db.execute(
      `
      SELECT
        COALESCE(tutor_id, volunteer_id) AS id,
        name,
        email,
        dni,
        role,
        status,
        lastLogin
      FROM users2
      WHERE tutor_id = ? OR volunteer_id = ?
      `,
      [userId, userId]
    );

    const updatedUser = updatedRows[0];
    console.log('✅ Usuario actualizado:', updatedUser);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ [updateUser] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario'
    });
  }
};

// @desc    Eliminar usuario (tutor o voluntario) de users2
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`==================== 🗑️ DELETE /api/users/${userId} ====================`);

  try {
    const [result] = await db.execute(
      `
      DELETE FROM users2
       WHERE tutor_id = ? OR volunteer_id = ?
      `,
      [userId, userId]
    );

    console.log('🗑️ Resultado de eliminación:', result);

    if (result.affectedRows === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario eliminado correctamente');
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('❌ [deleteUser] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario'
    });
  }
};
