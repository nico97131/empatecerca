import db from '../config/db.js';

// 📥 Obtener todos los estudiantes
export const getStudents = async (req, res) => {
  console.log('📥 GET /api/students');

  try {
    const [students] = await db.execute(`
      SELECT 
        s.*, 
        g.name AS groupName,
        d.name AS disciplineName,
        t.name AS tutorName,
        t.dni AS tutorDni,
        t.email AS tutorEmail,
        t.phone AS tutorPhone,
        t.join_date AS tutorJoinDate,
        mr.diagnosis, mr.allergies, mr.medications, mr.observations,
        mr.bloodType, mr.emergencyContactName, mr.emergencyContactPhone, 
        mr.emergencyContactRelation, mr.lastUpdate
      FROM students s
      LEFT JOIN grupos g ON s.groupId = g.id
      LEFT JOIN disciplines d ON s.discipline = d.id
      LEFT JOIN tutors t ON s.tutorId = t.id
      LEFT JOIN medical_records mr ON s.id = mr.student_id
    `);

    console.log(`✅ ${students.length} estudiante(s) obtenidos con ficha médica`);
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('❌ [getStudents] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes' });
  }
};


// 🔍 Obtener un estudiante por ID
export const getStudentById = async (req, res) => {
  console.log(`📥 GET /api/students/${req.params.id}`);

  try {
    const [rows] = await db.execute(`
      SELECT s.*, 
             mr.allergies, mr.medications, mr.diagnosis, mr.observations, 
             mr.bloodType, mr.emergencyContactName, mr.emergencyContactPhone, 
             mr.emergencyContactRelation, mr.lastUpdate
      FROM students s
      LEFT JOIN medical_records mr ON s.id = mr.student_id
      WHERE s.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      console.warn('⚠️ Estudiante no encontrado');
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    console.log('✅ Estudiante encontrado:', rows[0]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ [getStudentById] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estudiante' });
  }
};

// 🆕 Crear nuevo estudiante
export const createStudent = async (req, res) => {
  console.log('📥 POST /api/students - Datos recibidos:', req.body);

  const { firstName, lastName, dni, birthDate, tutorId, discipline, groupId } = req.body;

  if (!firstName || !lastName || !dni || !birthDate) {
    console.warn('⚠️ Faltan campos obligatorios');
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
    });
  }

  try {
    // 1️⃣ Insertar estudiante
    const [result] = await db.execute(
      `INSERT INTO students (firstName, lastName, dni, birthDate, tutorId, discipline, groupId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, dni, birthDate, tutorId || null, discipline || null, groupId || null]
    );

    const studentId = result.insertId;

    // 2️⃣ Crear automáticamente ficha médica vacía
    await db.execute(
      `INSERT INTO medical_records (student_id) VALUES (?)`,
      [studentId]
    );

    // 3️⃣ Buscar el nuevo estudiante con sus datos
    const [newStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [studentId]);

    console.log('✅ Estudiante y ficha médica creada con ID:', studentId);
    res.status(201).json({ success: true, data: newStudent[0] });

  } catch (error) {
    console.error('❌ [createStudent] Error:', error);
    res.status(500).json({ success: false, message: 'Error al crear estudiante' });
  }
};


// ✏️ Actualizar estudiante
export const updateStudent = async (req, res) => {
  console.log(`✏️ PUT /api/students/${req.params.id} - Datos recibidos:`, req.body);

  const { firstName, lastName, birthDate, dni, tutorId, discipline, groupId } = req.body;

  if (!firstName || !lastName || !birthDate || !dni) {
    console.warn('⚠️ Campos obligatorios faltantes');
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
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
        tutorId || null,
        discipline || null,
        groupId || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      console.warn('❌ Estudiante no encontrado');
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const [updated] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
    console.log('✅ Estudiante actualizado:', updated[0]);

    res.json({
      success: true,
      message: 'Estudiante actualizado correctamente',
      data: updated[0]
    });
  } catch (error) {
    console.error('💥 [updateStudent] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estudiante' });
  }
};

// 💾 Actualizar ficha médica del estudiante
export const updateMedicalRecord = async (req, res) => {
  console.log(`✏️ PUT /api/students/${req.params.id}/medical-record - Datos recibidos:`, req.body);

  const {
    diagnosis, allergies, medications, observations,
    bloodType, emergencyContactName, emergencyContactPhone, emergencyContactRelation,
    lastUpdate
  } = req.body;

  try {
const formattedLastUpdate = lastUpdate ? new Date(lastUpdate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // 🔎 Verificamos si existe una ficha médica para el estudiante
    const [existingRecord] = await db.execute(
      `SELECT id FROM medical_records WHERE student_id = ?`,
      [req.params.id]
    );

    if (existingRecord.length > 0) {
      console.log('📝 Ficha médica encontrada para actualizar:', existingRecord[0]);

      // ✅ Si existe, actualizamos
      const [updateResult] = await db.execute(
        `UPDATE medical_records
         SET diagnosis = ?, allergies = ?, medications = ?, observations = ?, bloodType = ?, 
             emergencyContactName = ?, emergencyContactPhone = ?, emergencyContactRelation = ?, 
             lastUpdate = ?
         WHERE student_id = ?`,
        [
          JSON.stringify(diagnosis || ''),
          JSON.stringify(allergies || []),
          JSON.stringify(medications || []),
          observations || '',
          bloodType || '',
          emergencyContactName || '',
          emergencyContactPhone || '',
          emergencyContactRelation || '',
          formattedLastUpdate,
          req.params.id
        ]
      );

      if (updateResult.affectedRows === 0) {
        console.warn('⚠️ No se modificó ninguna fila. Puede que los datos enviados sean iguales a los existentes.');
      }

      console.log('✅ Ficha médica actualizada correctamente');
      res.json({ success: true, message: 'Ficha médica actualizada correctamente' });

    } else {
      console.log('📄 No existe ficha médica, creando nueva...');

      // 🚀 Si no existe, creamos una nueva
      await db.execute(
        `INSERT INTO medical_records 
         (student_id, diagnosis, allergies, medications, observations, bloodType, 
          emergencyContactName, emergencyContactPhone, emergencyContactRelation, 
          lastUpdate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params.id,
          diagnosis || '',
          JSON.stringify(allergies || []),
          JSON.stringify(medications || []),
          observations || '',
          bloodType || '',
          emergencyContactName || '',
          emergencyContactPhone || '',
          emergencyContactRelation || '',
          formattedLastUpdate
        ]
      );

      console.log('✅ Ficha médica creada correctamente');
      res.json({ success: true, message: 'Ficha médica creada correctamente' });
    }

  } catch (error) {
    console.error('💥 [updateMedicalRecord] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar/crear ficha médica' });
  }
};



// 🗑️ Eliminar estudiante
export const deleteStudent = async (req, res) => {
  console.log(`🗑️ DELETE /api/students/${req.params.id}`);

  try {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      console.warn('⚠️ Estudiante no encontrado');
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    console.log('✅ Estudiante eliminado correctamente');
    res.json({ success: true, message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('❌ [deleteStudent] Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar estudiante' });
  }
};
