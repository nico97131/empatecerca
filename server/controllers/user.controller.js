import db from '../config/db.js';

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, dni, role, status, lastLogin FROM users'
    );
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ [getUsers] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, dni, role, status, lastLogin FROM users WHERE id = ?',
      [req.params.id]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ [getUser] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario'
    });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  const { name, email, password, dni, role, status } = req.body;

  if (!name || !email || !password || !dni) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
    });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, dni, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, dni, role || 'voluntario', status || 'active']
    );

    const [newUser] = await db.execute(
      'SELECT id, name, email, dni, role, status FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newUser[0]
    });
  } catch (error) {
    console.error('❌ [createUser] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario'
    });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const { name, email, role, status, dni } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE users SET name = ?, email = ?, dni = ?, role = ?, status = ? WHERE id = ?',
      [name, email, dni, role, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const [updatedUser] = await db.execute(
      'SELECT id, name, email, dni, role, status FROM users WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('❌ [updateUser] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario'
    });
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('❌ [deleteUser] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario'
    });
  }
};
