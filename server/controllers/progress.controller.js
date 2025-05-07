import pool from '../config/db.js';

// GET /api/progress
export const getProgress = async (req, res) => {
  try {
    console.log("📡 Iniciando consulta de progreso");

    const [rows] = await pool.query(`
      SELECT p.*, 
             CONCAT(s.firstName, ' ', s.lastName) AS studentName,
             v.name AS volunteerName

      FROM progress p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN volunteers v ON p.volunteer_id = v.id
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("❌ Error en getProgress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// GET /api/progress/student/:studentId
export const getStudentProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS volunteerName
      FROM progress p
      LEFT JOIN volunteers v ON p.volunteer_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE p.student_id = ?
      ORDER BY p.date DESC
    `, [req.params.studentId]);    
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progress/group/:groupId
export const getGroupProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, CONCAT(s.first_name, ' ', s.last_name) AS studentName, u.name AS volunteerName
      FROM progress p
      JOIN students s ON p.student_id = s.id
      JOIN volunteers v ON p.volunteer_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE s.group_id = ?
      ORDER BY p.date DESC
    `, [req.params.groupId]);    
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/progress
export const createProgress = async (req, res) => {
  try {
    console.log("📥 Request body recibido en backend:", req.body);
    console.log("👤 Usuario autenticado:", req.user); // tiene id, role, name, email, dni

    const {
      studentId,
      date,
      attendance,
      performance,
      activities,
      notes,
    } = req.body;

    // Buscar el ID real del voluntario en la tabla volunteers usando el dni del user logueado
    const [volunteerRows] = await pool.query(
      'SELECT id FROM volunteers WHERE dni = ?',
      [req.user.dni]
    );

    if (volunteerRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No se encontró voluntario con DNI ${req.user.dni}`,
      });
    }

    const volunteerId = volunteerRows[0].id;

    const [result] = await pool.query(
      `INSERT INTO progress 
        (student_id, volunteer_id, date, attendance, performance, activities, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        volunteerId,
        date,
        attendance,
        performance,
        JSON.stringify(activities),
        notes || null,
      ]
    );

    console.log("✅ Registro de progreso insertado con ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Progreso creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error en createProgress:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// PUT /api/progress/:id
export const updateProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM progress WHERE id = ?`, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    const progress = rows[0];
    if (progress.volunteer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { student_id, date, attendance, performance, activities, notes } = req.body;
    await pool.query(`
      UPDATE progress SET student_id = ?, date = ?, attendance = ?, performance = ?, activities = ?, notes = ?
      WHERE id = ?
    `, [
      student_id,
      date,
      attendance,
      performance,
      JSON.stringify(activities),
      notes,
      req.params.id
    ]);

    res.json({ success: true, message: 'Registro actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/progress/:id
export const deleteProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM progress WHERE id = ?`, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    const progress = rows[0];
    if (progress.volunteer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await pool.query(`DELETE FROM progress WHERE id = ?`, [req.params.id]);

    res.json({ success: true, message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
