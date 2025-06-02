import db from '../config/db.js';

/**
 * @desc    Obtener promedio y cantidad de calificaciones por voluntario
 * @route   GET /api/ratings
 * @access  Private
 */
export const getVolunteerRatingsSummary = async (req, res) => {
  console.log('📥 GET /api/ratings');

  try {
    const [rows] = await db.query(`
        SELECT 
          vr.volunteer_id,
          CONCAT(v.first_name, ' ', v.last_name) AS name,
          v.email,
          ROUND(AVG(vr.score), 1) AS averageRating,
          COUNT(*) AS totalRatings,
          COALESCE(JSON_ARRAYAGG(
            JSON_OBJECT(
              'tutorName', t.name,
              'feedback', vr.feedback,
              'date', vr.date
            )
          ), JSON_ARRAY()) AS feedback
        FROM volunteer_ratings vr
        JOIN volunteers v ON v.id = vr.volunteer_id
        JOIN tutors t ON t.id = vr.tutor_id
        GROUP BY vr.volunteer_id
      `);


    console.log(`✅ Calificaciones obtenidas para ${rows.length} voluntario(s)`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('❌ [getVolunteerRatingsSummary] Error:', error.message);

    res.status(500).json({ success: false, message: 'Error al obtener calificaciones' });
  }
};

/**
 * @desc    Obtener feedback detallado para un voluntario
 * @route   GET /api/ratings/:volunteerId
 * @access  Private
 */
export const getVolunteerFeedback = async (req, res) => {
  const { volunteerId } = req.params;
  console.log(`📥 GET /api/ratings/${volunteerId}`);

  try {
    const [rows] = await db.query(`
      SELECT 
        vr.score,
        vr.feedback,
        vr.date,
        t.name AS tutor_name
      FROM volunteer_ratings vr
      JOIN tutors t ON t.id = vr.tutor_id
      WHERE vr.volunteer_id = ?
      ORDER BY vr.date DESC
    `, [volunteerId]);

    console.log(`✅ ${rows.length} comentarios obtenidos para voluntario ${volunteerId}`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ [getVolunteerFeedback] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener feedback del voluntario' });
  }
};

/**
 * @desc    Registrar una nueva calificación (solo una vez por semana)
 * @route   POST /api/ratings
 * @access  Private/Tutor
 */
export const createVolunteerRating = async (req, res) => {
  console.log('📥 POST /api/ratings - Datos recibidos:', req.body);

  // Acomodamos la destructuración para que coincida con lo que envía el frontend:
  const { volunteer_id, tutorDni, score, feedback } = req.body;

  // 1) Validar que vengan los datos mínimos
  if (!volunteer_id || !tutorDni || !score) {
    console.warn('⚠️ Campos obligatorios faltantes');
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    // 2) Buscar el ID del tutor en base a su DNI (usamos la variable tutorDni)
    const [tutorRows] = await db.query(
      `SELECT id 
       FROM tutors 
       WHERE dni = ? 
       LIMIT 1`,
      [tutorDni]
    );

    if (tutorRows.length === 0) {
      console.warn(`⚠️ No se encontró ningún tutor con DNI ${tutorDni}`);
      return res.status(404).json({ success: false, message: 'Tutor no encontrado' });
    }

    const tutor_id = tutorRows[0].id;
    console.log(`🪪 [createVolunteerRating] tutor_id resuelto por DNI (${tutorDni}) → ${tutor_id}`);

    // 3) Comprobar si ya hay calificación esta semana por ese tutor y voluntario
    const [existing] = await db.query(
      `SELECT id 
       FROM volunteer_ratings
       WHERE tutor_id = ?
         AND volunteer_id = ?
         AND WEEK(date, 1) = WEEK(CURDATE(), 1)
         AND YEAR(date) = YEAR(CURDATE())
       LIMIT 1`,
      [tutor_id, volunteer_id]
    );

    if (existing.length > 0) {
      console.warn('⚠️ Ya existe una calificación esta semana');
      return res.status(409).json({ success: false, message: 'Ya calificaste a este voluntario esta semana' });
    }

    // 4) Insertar la nueva calificación usando el ID de tutor correcto
    const [result] = await db.query(
      `INSERT INTO volunteer_ratings
         (volunteer_id, tutor_id, score, feedback, date)
       VALUES (?, ?, ?, ?, CURRENT_DATE)`,
      [volunteer_id, tutor_id, score, feedback]
    );

    console.log('✅ Calificación registrada con ID:', result.insertId);
    return res.status(201).json({ success: true, message: 'Calificación registrada', id: result.insertId });

  } catch (error) {
    console.error('❌ [createVolunteerRating] Error completo:', error);
    console.error('❌ [createVolunteerRating] Mensaje MySQL:', error.sqlMessage || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar calificación',
      detalle: error.sqlMessage || error.message
    });
  }
};


