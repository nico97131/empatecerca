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
          v.name,
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
 * @desc    Registrar una nueva calificación
 * @route   POST /api/ratings
 * @access  Private/Tutor
 */
export const createVolunteerRating = async (req, res) => {
  console.log('📥 POST /api/ratings - Datos recibidos:', req.body);

  const { volunteer_id, tutor_id, score, feedback, date } = req.body;

  if (!volunteer_id || !tutor_id || !score || !date) {
    console.warn('⚠️ Campos obligatorios faltantes');
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO volunteer_ratings (volunteer_id, tutor_id, score, feedback, date)
      VALUES (?, ?, ?, ?, ?)
    `, [volunteer_id, tutor_id, score, feedback, date]);

    console.log('✅ Calificación registrada con ID:', result.insertId);
    res.status(201).json({ success: true, message: 'Calificación registrada', id: result.insertId });
  } catch (error) {
    console.error('❌ [createVolunteerRating] Error:', error);
    res.status(500).json({ success: false, message: 'Error al registrar calificación' });
  }
};
