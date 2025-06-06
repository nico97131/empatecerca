// src/controllers/contactsController.js

import db from '../config/db.js';

// 🔧 Crear usuario desde tutor (ahora en users2)
async function createUserFromTutor({ name, dni, email }) {
  try {
    console.log('🛠️ [createUserFromTutor] Ejecutando con:', { name, dni, email });

    const nombreNormalizado = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/ /g, '.')
      .replace(/[^a-zA-Z0-9.]/g, '');

    const finalEmail = email || `${nombreNormalizado}@empate.org`;
    console.log('📧 Email final generado:', finalEmail);

    // Verificamos en users2 si ya existe un registro con este DNI en la columna tutor_id
    const [existing] = await db.query(
      `SELECT tutor_id AS id FROM users2 WHERE dni = ? AND tutor_id IS NOT NULL`,
      [dni]
    );
    console.log('🔍 Resultado búsqueda usuario existente en users2:', existing);

    if (existing.length > 0) {
      console.log('⚠️ Ya existe un usuario-tutor con este DNI. No se crea otro.');
      return;
    }

    // Insertamos en users2; la columna tutor_id es AUTO_INCREMENT
    await db.query(
      `
      INSERT INTO users2 (name, email, dni, password, role, status)
      VALUES (?, ?, ?, ?, 'tutor', 'active')
      `,
      [name, finalEmail, dni, dni]
    );

    console.log(`✅ Usuario (tutor) creado automáticamente en users2 con email ${finalEmail}`);
  } catch (err) {
    console.error('❌ Error al crear usuario desde tutor en users2:', err);
  }
}

// ─── Crear tutor ───────────────────────────────────────────────────────────────────────────────────────────
// @route POST /api/tutors
export const createTutor = async (req, res) => {
  console.log('📥 POST /api/tutors');
  console.log('📝 Datos recibidos:', req.body);

  try {
    const { name, dni, email, phone, wantsUser } = req.body;

    // Verificamos si ya existe tutor en tabla tutors
    const [existingTutor] = await db.query(
      `SELECT id FROM tutors WHERE dni = ?`,
      [dni]
    );
    if (existingTutor.length > 0) {
      console.log('⚠️ Ya existe un tutor con ese DNI');
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tutor con ese DNI'
      });
    }

    // Insertamos en tutors
    const [result] = await db.query(
      `
      INSERT INTO tutors (name, dni, email, phone, wantsUser, join_date)
      VALUES (?, ?, ?, ?, ?, CURRENT_DATE)
      `,
      [name, dni, email || null, phone || null, Number(wantsUser) === 1 ? 1 : 0]
    );

    console.log('📦 Tutor insertado con ID:', result.insertId);

    if (Number(wantsUser) === 1) {
      console.log('🔧 Se solicitó creación de usuario para este tutor');
      await createUserFromTutor({
        name,
        dni,
        email
      });
    } else {
      console.log('⛔ El tutor no pidió usuario, se omite creación en users2');
    }

    res.status(201).json({
      success: true,
      message: 'Tutor creado correctamente',
      data: {
        id: result.insertId,
        name,
        dni,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('❌ [createTutor] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el tutor'
    });
  }
};

// ─── Obtener todos los tutores ─────────────────────────────────────────────────────────────────────────────
// @route GET /api/tutors
export const getAllTutors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tutors');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ [getAllTutors] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tutores' });
  }
};

// ─── Actualizar tutor ─────────────────────────────────────────────────────────────────────────────────────
// @route PUT /api/tutors/:id
export const updateTutor = async (req, res) => {
  const { id } = req.params;
  const { name, dni, email, phone, wantsUser } = req.body;

  try {
    await db.query(
      `
      UPDATE tutors
         SET name = ?, dni = ?, email = ?, phone = ?, wantsUser = ?
       WHERE id = ?
      `,
      [name, dni, email || null, phone || null, wantsUser ? 1 : 0, id]
    );

    if (wantsUser === true) {
      console.log('🔧 Se solicitó creación/actualización de usuario en users2 para este tutor');
      await createUserFromTutor({
        name,
        dni,
        email
      });
    }

    res.json({ success: true, message: 'Tutor actualizado correctamente' });
  } catch (error) {
    console.error('❌ [updateTutor] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el tutor' });
  }
};

// ─── Eliminar tutor ────────────────────────────────────────────────────────────────────────────────────────
// @route DELETE /api/tutors/:id
export const deleteTutor = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM tutors WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tutor eliminado correctamente' });
  } catch (error) {
    console.error('❌ [deleteTutor] Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el tutor' });
  }
};

// ─── Obtener voluntarios asignados a los alumnos de un tutor ───────────────────────────────────────────────
// @route GET /api/tutors/:id/volunteers
export const getVolunteersByTutor = async (req, res) => {
  const tutorId = req.params.id;

  try {
    const [results] = await db.query(
      `
      SELECT DISTINCT
        v.id,
        CONCAT(v.first_name, ' ', v.last_name) AS name,
        v.email,
        v.dni,
        g.name                               AS groupName,
        s.firstName                          AS studentName,
        'voluntario'                         AS role
      FROM students s
      JOIN student_group sg      ON s.id = sg.student_id
      JOIN grupos g              ON sg.group_id = g.id
      JOIN group_volunteers gv   ON g.id = gv.group_id
      JOIN volunteers v          ON gv.volunteer_id = v.id
      WHERE s.tutorId = ?
      `,
      [tutorId]
    );

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('❌ [getVolunteersByTutor] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener voluntarios' });
  }
};

// ─── Obtener tutor por DNI ─────────────────────────────────────────────────────────────────────────────────
// @route GET /api/tutors/dni/:dni
export const getTutorByDni = async (req, res) => {
  const { dni } = req.params;
  console.log(`📥 GET /api/tutors/dni/${dni}`);

  try {
    const [rows] = await db.query('SELECT * FROM tutors WHERE dni = ?', [dni]);

    if (rows.length === 0) {
      console.warn(`⚠️ No se encontró tutor con DNI: ${dni}`);
      return res.status(404).json({ error: 'Tutor no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('❌ [getTutorByDni] Error:', err);
    res.status(500).json({ error: 'Error al buscar tutor por DNI' });
  }
};
