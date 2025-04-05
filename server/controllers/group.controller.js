import db from '../config/db.js';

// @desc    Obtener todos los grupos
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const [groups] = await db.execute('SELECT * FROM grupos');
    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    console.error('❌ Error al obtener grupos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los grupos'
    });
  }
};

// @desc    Obtener un grupo por ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM grupos WHERE id = ?', [req.params.id]);
    const group = rows[0];

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear grupo
// @route   POST /api/groups
// @access  Private/Admin
export const createGroup = async (req, res) => {
  const { name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge } = req.body;

  console.log('[📥 GroupController] Datos recibidos para crear grupo:', {
    name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge
  });

  try {
    const [result] = await db.execute(
      'INSERT INTO grupos (name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge || null]
    );

    const newGroupId = result.insertId;
    const [newGroup] = await db.execute('SELECT * FROM grupos WHERE id = ?', [newGroupId]);

    res.status(201).json({
      success: true,
      data: newGroup[0]
    });
  } catch (error) {
    console.error('❌ Error al crear grupo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear el grupo',
      error: error.message // 🧠 Agregamos detalle para verlo desde el frontend si querés
    });
  }
};


// @desc    Actualizar grupo
// @route   PUT /api/groups/:id
// @access  Private/Admin
export const updateGroup = async (req, res) => {
  const { name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE grupos SET name = ?, discipline = ?, schedule = ?, maxMembers = ?, currentMembers = ?, location = ?, volunteerInCharge = ? WHERE id = ?',
      [name, discipline, schedule, maxMembers, currentMembers, location, volunteerInCharge || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const [updatedGroup] = await db.execute('SELECT * FROM grupos WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      data: updatedGroup[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar grupo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el grupo'
    });
  }
};

// @desc    Eliminar grupo
// @route   DELETE /api/groups/:id
// @access  Private/Admin
export const deleteGroup = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM grupos WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar grupo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el grupo'
    });
  }
}

// @desc    Agregar alumno a grupo
// @route   POST /api/groups/:id/students
// @access  Private/Admin
export const addStudentToGroup = async (req, res) => {
  const groupId = req.params.id;
  const { studentId } = req.body;

  try {
    // Verificar que el grupo exista
    const [groupRows] = await db.execute('SELECT * FROM grupos WHERE id = ?', [groupId]);
    if (groupRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    // Verificar capacidad
    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS count FROM alumno_grupo WHERE grupo_id = ?',
      [groupId]
    );
    if (countRows[0].count >= groupRows[0].maxMembers) {
      return res.status(400).json({ success: false, message: 'El grupo está completo' });
    }

    // Verificar si ya está asignado
    const [existingRows] = await db.execute(
      'SELECT * FROM alumno_grupo WHERE grupo_id = ? AND alumno_id = ?',
      [groupId, studentId]
    );
    if (existingRows.length > 0) {
      return res.status(400).json({ success: false, message: 'Alumno ya asignado a este grupo' });
    }

    // Insertar en tabla intermedia
    await db.execute(
      'INSERT INTO alumno_grupo (grupo_id, alumno_id) VALUES (?, ?)',
      [groupId, studentId]
    );

    res.json({ success: true, message: 'Alumno agregado al grupo correctamente' });
  } catch (error) {
    console.error('❌ Error al agregar alumno:', error.message);
    res.status(500).json({ success: false, message: 'Error al agregar alumno al grupo' });
  }
};

// @desc    Eliminar alumno de grupo
// @route   DELETE /api/groups/:id/students/:studentId
// @access  Private/Admin
export const removeStudentFromGroup = async (req, res) => {
  const groupId = req.params.id;
  const studentId = req.params.studentId;

  try {
    const [result] = await db.execute(
      'DELETE FROM alumno_grupo WHERE grupo_id = ? AND alumno_id = ?',
      [groupId, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado en el grupo' });
    }

    res.json({ success: true, message: 'Alumno removido del grupo correctamente' });
  } catch (error) {
    console.error('❌ Error al remover alumno:', error.message);
    res.status(500).json({ success: false, message: 'Error al remover alumno del grupo' });
  }
};



;
