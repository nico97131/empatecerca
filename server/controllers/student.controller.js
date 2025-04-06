import db from '../config/db.js';

// 📥 Obtener todos los estudiantes
export const getStudents = async (req, res) => {
  try {
    const [students] = await db.execute('SELECT * FROM students');
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('❌ Error al obtener estudiantes:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes' });
  }
};

// 🔍 Obtener un estudiante por ID
export const getStudentById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ Error al obtener estudiante:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener estudiante' });
  }
};

// 🆕 Crear nuevo estudiante
export const createStudent = async (req, res) => {
  const { firstName, lastName, dni, birthDate, tutorId, discipline, groupId } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO students (firstName, lastName, dni, birthDate, tutorId, discipline, groupId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, dni, birthDate, tutorId, discipline || null, groupId || null]
    );

    const [newStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newStudent[0] });
  } catch (error) {
    console.error('❌ Error al crear estudiante:', error.message);
    res.status(500).json({ success: false, message: 'Error al crear estudiante' });
  }
};

// ✅ Actualizar estudiante
export const updateStudent = async (req, res) => {
    console.log('🛠️ [PUT] /api/students/:id');
    console.log('📥 ID recibido:', req.params.id);
    console.log('📥 Body recibido:', req.body);
  
    const { firstName, lastName, birthDate, dni, tutorId, discipline, groupId } = req.body;
  
    if (!firstName || !lastName || !birthDate || !dni || !tutorId) {
      console.warn('⚠️ Campos obligatorios faltantes');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      });
    }
  
    try {
      const [result] = await db.execute(
        `UPDATE students 
         SET firstName = ?, lastName = ?, birthDate = ?, dni = ?, tutorId = ?, discipline = ?, groupId = ?
         WHERE id = ?`,
        [
          firstName,
          lastName,
          birthDate,
          dni,
          tutorId,
          discipline || null,
          groupId || null,
          req.params.id
        ]
      );
  
      console.log('🔄 Resultado de la actualización:', result);
  
      if (result.affectedRows === 0) {
        console.warn('❌ No se encontró estudiante con ese ID');
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado',
        });
      }
  
      // 🔍 Confirmar actualización
      const [updated] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
      console.log('✅ Estudiante actualizado:', updated[0]);
  
      res.json({
        success: true,
        message: 'Estudiante actualizado correctamente',
        data: updated[0]
      });
  
    } catch (error) {
      console.error('💥 Error al actualizar estudiante:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estudiante',
        error: error.message
      });
    }
  };

// 🗑️ Eliminar estudiante
export const deleteStudent = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    res.json({ success: true, message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar estudiante:', error.message);
    res.status(500).json({ success: false, message: 'Error al eliminar estudiante' });
  }
};
