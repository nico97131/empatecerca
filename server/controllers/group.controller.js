import db from '../config/db.js';

// @desc Obtener todos los grupos con disciplina, voluntarios y horarios
export const getGroups = async (req, res) => {
  console.log('📥 GET /api/groups - Obteniendo todos los grupos');

  try {
    const [groups] = await db.execute(`
      SELECT g.*, d.name AS discipline_name
      FROM grupos g
      LEFT JOIN disciplines d ON g.discipline_id = d.id
    `);

    const [groupVolunteers] = await db.execute(`
      SELECT gv.group_id, v.id, v.name, v.dni
      FROM group_volunteers gv
      JOIN volunteers v ON gv.volunteer_id = v.id
    `);

    const [groupSchedules] = await db.execute(`
      SELECT group_id, day, time_from, time_to
      FROM group_schedule
    `);

    const [studentCounts] = await db.execute(`
      SELECT group_id, COUNT(*) AS total
      FROM student_group
      GROUP BY group_id
    `);

    const groupsWithDetails = groups.map(group => {
      const volunteers = groupVolunteers
        .filter(gv => gv.group_id === group.id)
        .map(({ id, name, dni }) => ({ id, name, dni }));

      const schedules = groupSchedules
        .filter(s => s.group_id === group.id)
        .map(({ day, time_from, time_to }) => ({
          day,
          time_from,
          time_to
        }));

      const countMatch = studentCounts.find(sc => sc.group_id === group.id);
      const currentMembers = countMatch ? countMatch.total : 0;

      const volunteerInCharge = volunteers.length > 0 ? volunteers[0].id : null;

      return {
        ...group,
        currentMembers, // 🔥 Reemplazamos el valor guardado
        volunteers,
        volunteerInCharge, // 👈 agregado para que el panel lo use
        schedules: schedules.length ? schedules : [{ day: 'No cargado', time_from: '', time_to: '' }]
      };
    });

    res.json({
      success: true,
      count: groupsWithDetails.length,
      data: groupsWithDetails
    });
  } catch (error) {
    console.error('❌ [getGroups] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los grupos' });
  }
};


// @desc Obtener grupo por ID
export const getGroup = async (req, res) => {
  console.log(`📥 GET /api/groups/${req.params.id}`);

  try {
    const [rows] = await db.execute(`
      SELECT g.*, d.name AS discipline_name
      FROM grupos g
      LEFT JOIN disciplines d ON g.discipline_id = d.id
      WHERE g.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      console.log('❌ Grupo no encontrado');
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    console.log('✅ Grupo encontrado:', rows[0]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ [getGroup] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Crear grupo
// @desc Crear grupo
export const createGroup = async (req, res) => {
  console.log('📥 POST /api/groups - Datos recibidos:', req.body);

  const {
    name,
    discipline_id,
    maxMembers,
    currentMembers = 0,
    location,
    volunteerInCharge,
    schedules = [],
    volunteers = []
  } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO grupos (name, maxMembers, currentMembers, location, volunteerInCharge, discipline_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, maxMembers, currentMembers, location, volunteerInCharge || null, discipline_id]
    );

    const newGroupId = result.insertId;
    console.log('✅ Grupo creado con ID:', newGroupId);

    // 🕒 Insertar horarios
    if (schedules.length > 0) {
      const values = schedules.map(s => [newGroupId, s.day, s.time_from, s.time_to]);
      await db.query(
        'INSERT INTO group_schedule (group_id, day, time_from, time_to) VALUES ?',
        [values]
      );
      console.log(`🕒 ${schedules.length} horario(s) agregados a group_schedule`);
    }

    // 🙋 Insertar voluntarios
    if (volunteers.length > 0) {
      const values = volunteers.map(volId => [newGroupId, volId]);
      await db.query(
        'INSERT INTO group_volunteers (group_id, volunteer_id) VALUES ?',
        [values]
      );
      console.log(`🙋 ${volunteers.length} voluntario(s) asignados al grupo`);
    }

    res.status(201).json({
      success: true,
      message: 'Grupo creado exitosamente'
    });
  } catch (error) {
    console.error('❌ [createGroup] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el grupo'
    });
  }
};


// @desc Actualizar grupo
export const updateGroup = async (req, res) => {
  console.log(`✏️ PUT /api/groups/${req.params.id} - Datos recibidos:`, req.body);

  const { name, discipline_id, maxMembers, location, volunteers = [], schedules = [] } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE grupos SET name = ?, maxMembers = ?, location = ?, discipline_id = ? WHERE id = ?',
      [name, maxMembers, location, discipline_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Grupo no encontrado');
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    // 🔄 Actualizar horarios
    await db.execute('DELETE FROM group_schedule WHERE group_id = ?', [req.params.id]);
    if (schedules.length > 0) {
      const values = schedules.map(s => [req.params.id, s.day, s.time_from, s.time_to]);
      await db.query('INSERT INTO group_schedule (group_id, day, time_from, time_to) VALUES ?', [values]);
      console.log(`🕒 Horarios actualizados (${schedules.length})`);
    }

    // 🔄 Actualizar voluntarios
    await db.execute('DELETE FROM group_volunteers WHERE group_id = ?', [req.params.id]);
    if (volunteers.length > 0) {
      const values = volunteers.map(volunteerId => [req.params.id, volunteerId]);
      await db.query('INSERT INTO group_volunteers (group_id, volunteer_id) VALUES ?', [values]);
      console.log(`🙋 Voluntarios actualizados (${volunteers.length})`);
    }

    // 🔄 Traer grupo actualizado
    const [updatedGroup] = await db.execute(`
      SELECT g.*, d.name AS discipline_name
      FROM grupos g
      LEFT JOIN disciplines d ON g.discipline_id = d.id
      WHERE g.id = ?
    `, [req.params.id]);

    res.json({ success: true, data: updatedGroup[0] });
  } catch (error) {
    console.error('❌ [updateGroup] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el grupo' });
  }
};


// @desc Eliminar grupo
export const deleteGroup = async (req, res) => {
  console.log(`🗑️ DELETE /api/groups/${req.params.id}`);

  try {
    const [result] = await db.execute('DELETE FROM grupos WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      console.log('❌ Grupo no encontrado');
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    console.log('✅ Grupo eliminado correctamente');
    res.json({ success: true, message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('❌ [deleteGroup] Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el grupo' });
  }
};

// @desc Agregar alumno a grupo
export const addStudentToGroup = async (req, res) => {
  const groupId = req.params.id;
  const { studentId } = req.body;
  console.log(`➕ POST /api/groups/${groupId}/students - Agregar alumno ID ${studentId}`);

  try {
    const [groupRows] = await db.execute('SELECT * FROM grupos WHERE id = ?', [groupId]);
    if (groupRows.length === 0) {
      console.log('❌ Grupo no encontrado');
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS count FROM student_group WHERE group_id = ?',
      [groupId]
    );
    if (countRows[0].count >= groupRows[0].maxMembers) {
      console.log('⚠️ El grupo está completo');
      return res.status(400).json({ success: false, message: 'El grupo está completo' });
    }

    const [existingRows] = await db.execute(
      'SELECT * FROM student_group WHERE group_id = ? AND student_id = ?',
      [groupId, studentId]
    );
    if (existingRows.length > 0) {
      console.log('⚠️ El alumno ya está asignado al grupo');
      return res.status(400).json({ success: false, message: 'Alumno ya asignado a este grupo' });
    }

    await db.execute(
      'INSERT INTO student_group (group_id, student_id) VALUES (?, ?)',
      [groupId, studentId]
    );

    console.log('✅ Alumno agregado correctamente');
    res.json({ success: true, message: 'Alumno agregado al grupo correctamente' });
  } catch (error) {
    console.error('❌ [addStudentToGroup] Error:', error);
    res.status(500).json({ success: false, message: 'Error al agregar alumno al grupo' });
  }
};

// @desc Eliminar alumno de grupo
export const removeStudentFromGroup = async (req, res) => {
  const groupId = req.params.id;
  const studentId = req.params.studentId;
  console.log(`➖ DELETE /api/groups/${groupId}/students/${studentId} - Remover alumno`);

  try {
    const [result] = await db.execute(
      'DELETE FROM student_group WHERE group_id = ? AND student_id = ?',
      [groupId, studentId]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Alumno no encontrado en el grupo');
      return res.status(404).json({ success: false, message: 'Alumno no encontrado en el grupo' });
    }

    console.log('✅ Alumno removido correctamente');
    res.json({ success: true, message: 'Alumno removido del grupo correctamente' });
  } catch (error) {
    console.error('❌ [removeStudentFromGroup] Error:', error);
    res.status(500).json({ success: false, message: 'Error al remover alumno del grupo' });
  }
};
