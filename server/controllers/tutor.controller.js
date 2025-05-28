import db from '../config/db.js';

// 🔧 Crear usuario desde tutor
async function createUserFromTutor({ id, name, dni, email }) {
  try {
    const nombreNormalizado = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/ /g, '.')
      .replace(/[^a-zA-Z0-9.]/g, '');

    const finalEmail = email || `${nombreNormalizado}@empate.org`;

    const [existingUser] = await db.query('SELECT id FROM users WHERE dni = ?', [dni]);
    if (existingUser.length > 0) {
      console.log('⚠️ Ya existe un usuario con este DNI. No se crea otro.');
      return;
    }

    await db.query(
      `INSERT INTO users (name, email, dni, password, role, status)
       VALUES (?, ?, ?, ?, 'tutor', 'active')`,
      [name, finalEmail, dni, dni]
    );

    console.log(`✅ Usuario creado automáticamente para tutor con email ${finalEmail}`);
  } catch (err) {
    console.error('❌ Error al crear usuario desde tutor:', err);
  }
}

// @desc Crear tutor
export const createTutor = async (req, res) => {
  console.log('📥 POST /api/tutors');
  console.log('📝 Datos recibidos:', req.body);

  try {
    const { name, dni, email, phone, wantsUser } = req.body;

    const [existingTutor] = await db.query('SELECT id FROM tutors WHERE dni = ?', [dni]);
    if (existingTutor.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tutor con ese DNI'
      });
    }

    const [result] = await db.query(
      `INSERT INTO tutors (name, dni, email, phone, wantsUser, join_date)
       VALUES (?, ?, ?, ?, ?, CURRENT_DATE)`,
      [name, dni, email || null, phone || null, Number(wantsUser) === 1 ? 1 : 0]
    );

    if (Number(wantsUser) === 1) {
      await createUserFromTutor({
        id: result.insertId,
        name,
        dni,
        email
      });
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

// @desc Obtener todos los tutores
export const getAllTutors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tutors');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ [getAllTutors] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tutores' });
  }
};

// @desc Actualizar tutor
export const updateTutor = async (req, res) => {
  const { id } = req.params;
  const { name, dni, email, phone, wantsUser } = req.body;

  try {
    await db.query(
      `UPDATE tutors
       SET name = ?, dni = ?, email = ?, phone = ?, wantsUser = ?
       WHERE id = ?`,
      [name, dni, email || null, phone || null, wantsUser ? 1 : 0, id]
    );

    if (wantsUser === true) {
      await createUserFromTutor({
        id,
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

// @desc Eliminar tutor
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
