import db from '../config/db.js';

/**
 * @desc    Obtener todas las disciplinas
 * @route   GET /api/disciplines
 * @access  Private
 */
export const getDisciplines = async (req, res) => {
  console.log('📥 GET /api/disciplines');

  try {
    const [rows] = await db.query('SELECT * FROM disciplines');
    console.log(`✅ ${rows.length} disciplina(s) obtenidas`);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('❌ [getDisciplines] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener disciplinas' });
  }
};

/**
 * @desc    Obtener una disciplina por ID
 * @route   GET /api/disciplines/:id
 * @access  Private
 */
export const getDiscipline = async (req, res) => {
  console.log(`📥 GET /api/disciplines/${req.params.id}`);

  try {
    const [rows] = await db.query('SELECT * FROM disciplines WHERE id = ?', [req.params.id]);
    const discipline = rows[0];

    if (!discipline) {
      console.warn('⚠️ Disciplina no encontrada');
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    console.log('✅ Disciplina encontrada:', discipline);
    res.json({ success: true, data: discipline });
  } catch (error) {
    console.error('❌ [getDiscipline] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener disciplina' });
  }
};

/**
 * @desc    Crear nueva disciplina
 * @route   POST /api/disciplines
 * @access  Private/Admin
 */
export const createDiscipline = async (req, res) => {
  console.log('📥 POST /api/disciplines - Datos recibidos:', req.body);

  const { name, description, category } = req.body;

  if (!name || !category) {
    console.warn('⚠️ Campos obligatorios faltantes');
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO disciplines (name, description, category) VALUES (?, ?, ?)',
      [name, description, category]
    );

    const newDiscipline = {
      id: result.insertId,
      name,
      description,
      category,
      groupsCount: 0
    };

    console.log('✅ Disciplina creada con ID:', result.insertId);
    res.status(201).json({
      success: true,
      data: newDiscipline
    });
  } catch (error) {
    console.error('❌ [createDiscipline] Error:', error);
    res.status(500).json({ success: false, message: 'Error al crear disciplina' });
  }
};

/**
 * @desc    Actualizar disciplina
 * @route   PUT /api/disciplines/:id
 * @access  Private/Admin
 */
export const updateDiscipline = async (req, res) => {
  console.log(`✏️ PUT /api/disciplines/${req.params.id} - Datos recibidos:`, req.body);

  const { name, description, category } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE disciplines SET name = ?, description = ?, category = ? WHERE id = ?',
      [name, description, category, req.params.id]
    );

    if (result.affectedRows === 0) {
      console.warn('⚠️ Disciplina no encontrada');
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    console.log('✅ Disciplina actualizada correctamente');
    res.json({ success: true, message: 'Discipline updated successfully' });
  } catch (error) {
    console.error('❌ [updateDiscipline] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar disciplina' });
  }
};

/**
 * @desc    Eliminar disciplina
 * @route   DELETE /api/disciplines/:id
 * @access  Private/Admin
 */
export const deleteDiscipline = async (req, res) => {
  console.log(`🗑️ DELETE /api/disciplines/${req.params.id}`);

  try {
    const [result] = await db.query('DELETE FROM disciplines WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      console.warn('⚠️ Disciplina no encontrada');
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    console.log('✅ Disciplina eliminada correctamente');
    res.json({ success: true, message: 'Discipline deleted successfully' });
  } catch (error) {
    console.error('❌ [deleteDiscipline] Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar disciplina' });
  }
};
