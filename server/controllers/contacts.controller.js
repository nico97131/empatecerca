// src/controllers/contactsController.js

import db from '../config/db.js';

// @desc Obtener contactos (tutores) para un voluntario
// @route GET /api/contacts/voluntario/:volunteerId
export const getContactsForVolunteer = async (req, res) => {
  const { volunteerId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DISTINCT 
        t.id,
        t.name,
        t.email,
        'tutor' AS role,
        s.firstName AS studentName,
        g.name AS groupName
      FROM student_group sg
      JOIN students s       ON sg.student_id = s.id
      JOIN tutors t         ON s.tutorId = t.id
      JOIN group_volunteers gv ON gv.group_id = sg.group_id
      JOIN grupos g         ON g.id = sg.group_id
      WHERE gv.volunteer_id = ?
      `,
      [volunteerId]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error('❌ Error al obtener contactos:', err);
    res.status(500).json({ error: 'Error al obtener contactos del voluntario' });
  }
};

// @desc Obtener contactos (tutores) para un voluntario, buscando por DNI
// @route GET /api/contacts/voluntario-dni/:dni
export const getContactsForVolunteerByDni = async (req, res) => {
  const { dni } = req.params;

  try {
    // 1. Verificamos que el voluntario exista
    const [volunteers] = await db.query(
      `SELECT id FROM volunteers WHERE dni = ?`,
      [dni]
    );
    if (volunteers.length === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un voluntario con DNI ${dni}` });
    }

    // 2. Recuperamos, para cada tutor:
    //    - users2.id   AS userId   (coincide con messages.from_id / messages.to_id)
    //    - users2.dni  AS tutorDni
    //    - resto de datos (name, email, etc.)
    // Forzamos la misma collation en la comparación de DNI para evitar mix de collations:
    const [rows] = await db.query(
      `
      SELECT DISTINCT
        u2.id                                AS userId,       -- usuarios.id en users2
        u2.dni                               AS tutorDni,     -- DNI del tutor
        t.name                               AS name,
        t.email                              AS email,
        'tutor'                              AS role,
        CONCAT(s.firstName, ' ', s.lastName) AS studentName,
        g.name                               AS groupName
      FROM group_volunteers gv
      JOIN volunteers v    ON v.id = gv.volunteer_id
      JOIN grupos g        ON g.id = gv.group_id
      JOIN student_group sg ON sg.group_id = g.id
      JOIN students s      ON s.id = sg.student_id
      JOIN tutors t        ON s.tutorId = t.id
      JOIN users2 u2       ON u2.dni COLLATE utf8mb4_general_ci = t.dni COLLATE utf8mb4_general_ci
      WHERE v.dni = ?
      `,
      [dni]
    );

    console.log('📤 Contactos encontrados:', rows.length);
    res.json({ data: rows });
  } catch (err) {
    console.error('❌ Error al obtener contactos por DNI:', err);
    res
      .status(500)
      .json({ error: 'Error interno al obtener contactos del voluntario por DNI' });
  }
};

// @desc Obtener contactos (voluntarios) para un tutor
// @route GET /api/contacts/tutor/:tutorId
export const getContactsForTutor = async (req, res) => {
  const { tutorId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DISTINCT 
        v.id,
        CONCAT(v.first_name, ' ', v.last_name) AS name,
        v.email,
        v.dni,
        'voluntario' AS role,
        s.firstName AS studentName,
        g.name AS groupName
      FROM students s
      JOIN student_group sg ON s.id = sg.student_id
      JOIN grupos g ON sg.group_id = g.id
      JOIN group_volunteers gv ON g.id = gv.group_id
      JOIN volunteers v ON gv.volunteer_id = v.id
      WHERE s.tutorId = ?
      `,
      [tutorId]
    );

    console.log('📤 Contactos encontrados para tutor:', rows.length);
    res.json({ data: rows });
  } catch (err) {
    console.error('❌ Error al obtener contactos del tutor:', err);
    res.status(500).json({ error: 'Error al obtener contactos del tutor' });
  }
};
