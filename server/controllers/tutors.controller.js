import db from '../config/db.js';

export const getTutors = async (req, res) => {
  console.log('📥 GET /api/tutors');
  try {
    const [tutors] = await db.execute(`
      SELECT id, name, dni, email, phone, join_date AS joinDate
      FROM tutors
    `);
    res.json({ success: true, data: tutors });
  } catch (error) {
    console.error('❌ [getTutors] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tutores' });
  }
};
