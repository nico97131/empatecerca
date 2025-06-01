import db from '../config/db.js';

// 🔧 Función auxiliar para crear usuario desde voluntario
async function createUserFromVolunteer(volunteer) {
  const nombreNormalizado = `${volunteer.first_name} ${volunteer.last_name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ /g, '.')
    .replace(/[^a-zA-Z0-9.]/g, '');

  const email = `${nombreNormalizado}@empate.org`;

  await db.query(
    `INSERT INTO users (name, email, dni, password, role, status)
     VALUES (?, ?, ?, ?, 'voluntario', 'active')`,
    [`${volunteer.first_name} ${volunteer.last_name}`, email, volunteer.dni, volunteer.dni]
  );

  console.log(`✅ Usuario creado automáticamente para voluntario con email ${email}`);
}

// @desc Get all volunteers
// @route GET /api/volunteers
export const getVolunteers = async (req, res) => {
  console.log('📥 GET /api/volunteers');

  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        first_name,
        last_name,
        CONCAT(first_name, ' ', last_name) AS name,
        dni,
        email,
        phone,
        discipline_id,
        join_date,
        status,
        inactive_reason
      FROM volunteers
    `);

    for (const volunteer of rows) {
      const [availabilityRows] = await db.query(
        'SELECT slot FROM volunteer_availability WHERE volunteer_id = ?',
        [volunteer.id]
      );
      volunteer.availability = availabilityRows.map(r => r.slot);

      // 👇 NUEVO: obtener los grupos asignados
      const [groupRows] = await db.query(
        'SELECT group_id FROM group_volunteers WHERE volunteer_id = ?',
        [volunteer.id]
      );
      volunteer.groups = groupRows.map(g => g.group_id); // esto es lo que necesitás en el frontend
    }

    console.log(`✅ Se obtuvieron ${rows.length} voluntarios`);
    res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('❌ [getVolunteers] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc Get single volunteer
// @route GET /api/volunteers/:id
export const getVolunteer = async (req, res) => {
  console.log(`📥 GET /api/volunteers/${req.params.id}`);

  try {
    const [rows] = await db.query('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      console.log('❌ Voluntario no encontrado');
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    console.log('✅ Voluntario encontrado:', rows[0]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ [getVolunteer] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create volunteer
// @route POST /api/volunteers
// @desc Create volunteer
// @route POST /api/volunteers
export const createVolunteer = async (req, res) => {
  console.log('📥 POST /api/volunteers');
  console.log('📝 Datos recibidos:', req.body);

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      dni,
      discipline_id,
      join_date,
      status,
      inactive_reason,
      availability,
      groups = [] // 👈 nuevo campo
    } = req.body;

    const name = `${first_name} ${last_name}`.trim();

    const [existingEmail] = await db.query('SELECT id FROM volunteers WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un voluntario con ese correo electrónico'
      });
    }

    const [existingDNI] = await db.query('SELECT id FROM volunteers WHERE dni = ?', [dni]);
    if (existingDNI.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un voluntario con ese DNI'
      });
    }

    const [result] = await db.query(
      `INSERT INTO volunteers
       (first_name, last_name, email, phone, dni, discipline_id, join_date, status, inactive_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        dni,
        discipline_id,
        join_date,
        status,
        status === 'inactive' ? inactive_reason : null
      ]
    );

    const volunteerId = result.insertId;
    console.log('✅ Voluntario creado con ID:', volunteerId);

    if (status === 'active') {
      await createUserFromVolunteer({ first_name, last_name, dni });
    }

    if (availability && Array.isArray(availability)) {
      const values = availability.map(slot => [volunteerId, slot]);
      await db.query(
        'INSERT INTO volunteer_availability (volunteer_id, slot) VALUES ?',
        [values]
      );
      console.log(`📆 Disponibilidad insertada para voluntario ${volunteerId}`);
    }

    // 🔥 NUEVO: insertar grupos si vienen
    if (Array.isArray(groups) && groups.length > 0) {
      const groupValues = groups.map(groupId => [volunteerId, groupId]);
      await db.query('INSERT INTO group_volunteers (volunteer_id, group_id) VALUES ?', [groupValues]);
      console.log(`📌 Grupos asignados al crear voluntario ${volunteerId}:`, groups);
    }

    res.status(201).json({
      success: true,
      data: { id: volunteerId, ...req.body, name }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      let message = 'Ya existe un registro con el mismo valor único';
      if (error.sqlMessage.includes('volunteers.email')) {
        message = 'Ya existe un voluntario con ese correo electrónico';
      } else if (error.sqlMessage.includes('volunteers.dni')) {
        message = 'Ya existe un voluntario con ese DNI';
      }
      return res.status(400).json({ success: false, message });
    }

    console.error('❌ [createVolunteer] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc Update volunteer
// @route PUT /api/volunteers/:id
// @desc Update volunteer
// @route PUT /api/volunteers/:id
export const updateVolunteer = async (req, res) => {
  console.log(`✏️ PUT /api/volunteers/${req.params.id}`);
  console.log('📝 Datos para actualizar:', req.body);

  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM volunteers WHERE id = ?', [id]);

    if (existing.length === 0) {
      console.log('❌ Voluntario no encontrado');
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      dni,
      discipline_id,
      join_date,
      status,
      inactive_reason,
      availability,
      groups = [] // 👈 nuevo campo
    } = req.body;

    const name = `${first_name} ${last_name}`.trim();

    const [emailCheck] = await db.query(
      'SELECT id FROM volunteers WHERE email = ? AND id != ?',
      [email, id]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un voluntario con ese correo electrónico'
      });
    }

    const [dniCheck] = await db.query(
      'SELECT id FROM volunteers WHERE dni = ? AND id != ?',
      [dni, id]
    );
    if (dniCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un voluntario con ese DNI'
      });
    }

    const fields = [];
    const values = [];

    const dataToUpdate = {
      first_name,
      last_name,
      email,
      phone,
      dni,
      discipline_id,
      join_date,
      status,
      inactive_reason: status === 'inactive' ? inactive_reason : null
    };

    for (const [field, value] of Object.entries(dataToUpdate)) {
      if (value !== undefined) {
        fields.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update' });
    }

    const updateQuery = `UPDATE volunteers SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await db.query(updateQuery, values);
    console.log('✅ Voluntario actualizado correctamente');

    if (status === 'active') {
      const [existingUser] = await db.query('SELECT id FROM users WHERE dni = ?', [dni]);
      if (existingUser.length === 0) {
        await createUserFromVolunteer({ first_name, last_name, dni });
      }
    }

    if (availability && Array.isArray(availability)) {
      await db.query('DELETE FROM volunteer_availability WHERE volunteer_id = ?', [id]);

      const values = availability.map(slot => [id, slot]);
      if (values.length > 0) {
        await db.query(
          'INSERT INTO volunteer_availability (volunteer_id, slot) VALUES ?',
          [values]
        );
        console.log(`📆 Disponibilidad actualizada para voluntario ${id}`);
      }
    }

    // 🔥 NUEVO: actualizar grupos
    if (Array.isArray(groups)) {
      await db.query('DELETE FROM group_volunteers WHERE volunteer_id = ?', [id]);

      if (groups.length > 0) {
        const values = groups.map(groupId => [id, groupId]);
        await db.query('INSERT INTO group_volunteers (volunteer_id, group_id) VALUES ?', [values]);
        console.log(`🔁 Grupos actualizados para voluntario ${id}:`, groups);
      } else {
        console.log(`📭 Voluntario ${id} quedó sin grupos asignados`);
      }
    }

    res.json({ success: true, message: 'Volunteer updated successfully' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      let message = 'Ya existe un valor duplicado';
      if (error.sqlMessage.includes('volunteers.email')) {
        message = 'Ya existe un voluntario con ese correo electrónico';
      } else if (error.sqlMessage.includes('volunteers.dni')) {
        message = 'Ya existe un voluntario con ese DNI';
      }
      return res.status(400).json({ success: false, message });
    }

    console.error('❌ [updateVolunteer] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc Delete volunteer
// @route DELETE /api/volunteers/:id
export const deleteVolunteer = async (req, res) => {
  console.log(`🗑️ DELETE /api/volunteers/${req.params.id}`);

  try {
    const [existing] = await db.query('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      console.log('❌ Voluntario no encontrado');
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // ✅ Eliminar relaciones antes
    await db.query('DELETE FROM group_volunteers WHERE volunteer_id = ?', [req.params.id]);

    // ✅ Ahora eliminar el voluntario
    await db.query('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
    console.log('✅ Voluntario eliminado correctamente');

    res.json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('❌ [deleteVolunteer] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc Update availability
// @route PUT /api/volunteers/:id/availability
export const updateAvailability = async (req, res) => {
  console.log(`🕒 PUT /api/volunteers/${req.params.id}/availability`);
  console.log('📋 Nueva disponibilidad:', req.body.availability);

  try {
    const [existing] = await db.query('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      console.log('❌ Voluntario no encontrado');
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    await db.query('DELETE FROM volunteer_availability WHERE volunteer_id = ?', [req.params.id]);
    console.log('🧹 Disponibilidad previa eliminada');

    const availability = req.body.availability || [];
    const insertValues = availability.map(a => [req.params.id, a.day, a.time_from, a.time_to]);

    if (insertValues.length > 0) {
      await db.query(
        'INSERT INTO volunteer_availability (volunteer_id, day, time_from, time_to) VALUES ?',
        [insertValues]
      );
      console.log('✅ Nueva disponibilidad registrada');
    } else {
      console.log('ℹ️ No se registró nueva disponibilidad (array vacío)');
    }

    res.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    console.error('❌ [updateAvailability] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get volunteer's groups
// @route GET /api/volunteers/:id/groups
export const getVolunteerGroups = async (req, res) => {
  console.log(`📥 GET /api/volunteers/${req.params.id}/groups`);

  try {
    const [groups] = await db.query(
      `SELECT g.* FROM grupos g
       JOIN group_volunteers gv ON g.id = gv.group_id
       WHERE gv.volunteer_id = ?`,
      [req.params.id]
    );

    console.log(`✅ ${groups.length} grupo(s) encontrados para el voluntario ${req.params.id}`);

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    console.error('❌ [getVolunteerGroups] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update volunteer status separately
// @route PUT /api/volunteers/:id/status
export const updateVolunteerStatus = async (req, res) => {
  console.log(`✏️ PUT /api/volunteers/${req.params.id}/status`);
  console.log('📝 Nuevo estado:', req.body);

  try {
    const { status, inactive_reason } = req.body;
    await db.query(
      'UPDATE volunteers SET status = ?, inactive_reason = ? WHERE id = ?',
      [status, status === 'inactive' ? inactive_reason : null, req.params.id]
    );
    console.log('✅ Estado del voluntario actualizado');
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('❌ [updateVolunteerStatus] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Asignar grupos a un voluntario
// @route PUT /api/volunteers/:id/groups
export const assignGroupsToVolunteer = async (req, res) => {
  const volunteerId = req.params.id;
  const { groupIds } = req.body;

  console.log(`🔄 Asignando grupos al voluntario ${volunteerId}:`, groupIds);

  if (!Array.isArray(groupIds)) {
    return res.status(400).json({ success: false, message: 'groupIds debe ser un array' });
  }

  try {
    // 1. Eliminar relaciones previas
    await db.query('DELETE FROM group_volunteers WHERE volunteer_id = ?', [volunteerId]);

    // 2. Insertar nuevas relaciones si hay
    if (groupIds.length > 0) {
      const values = groupIds.map(groupId => [volunteerId, groupId]);
      await db.query('INSERT INTO group_volunteers (volunteer_id, group_id) VALUES ?', [values]);
    }

    console.log('✅ Grupos asignados correctamente');
    res.json({ success: true, message: 'Grupos asignados correctamente' });
  } catch (error) {
    console.error('❌ [assignGroupsToVolunteer] Error:', error);
    res.status(500).json({ success: false, message: 'Error al asignar grupos' });
  }
};


