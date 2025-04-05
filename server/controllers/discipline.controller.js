import db from '../config/db.js';

/**
 * @desc    Obtener todas las disciplinas
 * @route   GET /api/disciplines
 * @access  Private
 */
export const getDisciplines = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM disciplines');
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Obtener una disciplina por ID
 * @route   GET /api/disciplines/:id
 * @access  Private
 */
export const getDiscipline = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM disciplines WHERE id = ?', [req.params.id]);
    const discipline = rows[0];

    if (!discipline) {
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    res.json({ success: true, data: discipline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Crear nueva disciplina
 * @route   POST /api/disciplines
 * @access  Private/Admin
 */
export const createDiscipline = async (req, res) => {
  const { name, description, category } = req.body;

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

    res.status(201).json({
      success: true,
      data: newDiscipline
    });
  } catch (error) {
    console.error('❌ Error al crear disciplina:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Actualizar disciplina
 * @route   PUT /api/disciplines/:id
 * @access  Private/Admin
 */
export const updateDiscipline = async (req, res) => {
  const { name, description, category } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE disciplines SET name = ?, description = ?, category = ? WHERE id = ?',
      [name, description, category, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    res.json({ success: true, message: 'Discipline updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Eliminar disciplina
 * @route   DELETE /api/disciplines/:id
 * @access  Private/Admin
 */
export const deleteDiscipline = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM disciplines WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Discipline not found' });
    }

    res.json({ success: true, message: 'Discipline deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
