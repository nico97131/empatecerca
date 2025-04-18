import db from '../config/db.js';

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  console.log('==================== 📥 GET /api/users ====================');

  try {
    const [users] = await db.execute(
      'SELECT id, name, email, dni, role, status, lastLogin FROM users'
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

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  console.log(`==================== 📥 GET /api/users/${req.params.id} ====================`);

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, dni, role, status, lastLogin FROM users WHERE id = ?',
      [req.params.id]
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

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ [getUser] Error:', error);
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
  console.log('==================== 🛠️ POST /api/users ====================');
  console.log('📥 Datos recibidos:', req.body);

  const { name, email, password, dni, role, status } = req.body;

  if (!name || !email || !password || !dni) {
    console.log('❌ Faltan campos obligatorios');
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

    console.log('✅ Usuario insertado con ID:', result.insertId);

    const [newUser] = await db.execute(
      'SELECT id, name, email, dni, role, status FROM users WHERE id = ?',
      [result.insertId]
    );

    console.log('📦 Usuario creado:', newUser[0]);

    res.status(201).json({
      success: true,
      data: newUser[0]
    });
  } catch (error) {
    console.error('❌ [createUser] Error:', error);
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
  console.log(`==================== ✏️ PUT /api/users/${req.params.id} ====================`);
  console.log('📥 Datos recibidos para actualizar:', req.body);

  const { name, email, role, status, dni } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE users SET name = ?, email = ?, dni = ?, role = ?, status = ? WHERE id = ?',
      [name, email, dni, role, status, req.params.id]
    );

    console.log('🔁 Resultado de actualización:', result);

    if (result.affectedRows === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const [updatedUser] = await db.execute(
      'SELECT id, name, email, dni, role, status FROM users WHERE id = ?',
      [req.params.id]
    );

    console.log('✅ Usuario actualizado:', updatedUser[0]);

    res.json({
      success: true,
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('❌ [updateUser] Error:', error);
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
  console.log(`==================== 🗑️ DELETE /api/users/${req.params.id} ====================`);

  try {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
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
