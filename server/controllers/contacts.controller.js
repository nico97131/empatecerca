// src/controllers/contactsController.js

import db from '../config/db.js';

// ─── Obtener contactos (tutores) para un voluntario ─────────────────────────────────────────────────────────
// @route GET /api/contacts/voluntario/:volunteerId
export const getContactsForVolunteer = async (req, res) => {
  const { volunteerId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DISTINCT
        u2.tutor_id                         AS id,
        u2.name,
        u2.email,
        'tutor'                             AS role,
        CONCAT(s.firstName, ' ', s.lastName) AS studentName,
        g.name                              AS groupName
      FROM student_group sg
      JOIN students s          ON sg.student_id = s.id
      JOIN group_volunteers gv ON gv.group_id = sg.group_id
      JOIN grupos g            ON g.id = sg.group_id
      JOIN users2 u2           ON u2.tutor_id = s.tutorId
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

// ─── Obtener contactos (tutores) para un voluntario, buscando por DNI ────────────────────────────────────────
// @route GET /api/contacts/voluntario-dni/:dni
export const getContactsForVolunteerByDni = async (req, res) => {
  const { dni } = req.params;

  try {
    // 1) Verificamos que exista un voluntario con ese DNI (en users2.volunteer_id)
    const [vols] = await db.query(
      `SELECT volunteer_id AS id
         FROM users2
        WHERE dni = ?
          AND volunteer_id IS NOT NULL`,
      [dni]
    );
    if (vols.length === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un voluntario con DNI ${dni}` });
    }

    // 2) Obtenemos los tutores asociados a ese voluntario
    const [rows] = await db.query(
      `
      SELECT DISTINCT
        u2.tutor_id                           AS userId,
        u2.dni                                AS tutorDni,
        u2.name                               AS name,
        u2.email                              AS email,
        'tutor'                               AS role,
        CONCAT(s.firstName, ' ', s.lastName)  AS studentName,
        g.name                                AS groupName
      FROM users2 u2
      JOIN students s           ON u2.tutor_id = s.tutorId
      JOIN student_group sg     ON sg.student_id = s.id
      JOIN grupos g             ON g.id = sg.group_id
      JOIN group_volunteers gv  ON gv.group_id = g.id
      JOIN users2 v2            ON v2.volunteer_id = gv.volunteer_id
      WHERE v2.dni = ?
      `,
      [dni]
    );

    console.log('📤 Contactos encontrados por DNI:', rows.length);
    res.json({ data: rows });
  } catch (err) {
    console.error('❌ Error al obtener contactos por DNI:', err);
    res
      .status(500)
      .json({ error: 'Error interno al obtener contactos del voluntario por DNI' });
  }
};

// ─── Obtener contactos (voluntarios) para un tutor ───────────────────────────────────────────────────────────
// @route GET /api/contacts/tutor/:tutorId
export const getContactsForTutor = async (req, res) => {
  const { tutorId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DISTINCT
        u2.volunteer_id                       AS id,
        u2.name,
        u2.email,
        u2.dni                                AS dni,
        'voluntario'                          AS role,
        CONCAT(s.firstName, ' ', s.lastName)  AS studentName,
        g.name                                AS groupName
      FROM users2 u2
      JOIN group_volunteers gv ON u2.volunteer_id = gv.volunteer_id
      JOIN grupos g             ON gv.group_id = g.id
      JOIN student_group sg     ON sg.group_id = g.id
      JOIN students s           ON s.id = sg.student_id
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
