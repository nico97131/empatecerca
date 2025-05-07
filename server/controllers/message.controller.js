import db from '../config/db.js';

/**
 * GET /api/messages
 */
export const getMessages = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM messages
      WHERE expiration_date >= CURDATE()
      ORDER BY publication_date DESC
    `);
        const parsedRows = rows.map(row => ({
      ...row,
      recipients: (() => {
        try {
          return JSON.parse(row.recipients);
        } catch {
          console.warn(`⚠️ Recipients inválido en mensaje ID ${row.id}:`, row.recipients);
          return [row.recipients]; // fallback: lo mete igual en un array
        }
      })()
    }));
    
    res.json({ success: true, data: parsedRows });
  } catch (error) {
    console.error('❌ [getMessages] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mensajes' });
  }
};

/**
 * POST /api/messages
 */
export const createMessage = async (req, res) => {
  const { subject, content, recipients, status, publication_date, expiration_date } = req.body;

  console.log('📨 [createMessage] Datos recibidos:', req.body);

  if (!subject || !content || !recipients?.length || !publication_date || !expiration_date) {
    console.warn('⚠️ [createMessage] Faltan campos obligatorios');
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO messages (subject, content, recipients, status, publication_date, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        subject,
        content,
        JSON.stringify(recipients),
        status || 'sent',
        publication_date,
        expiration_date
      ]
    );

    console.log('✅ [createMessage] Mensaje insertado con ID:', result.insertId);
    res.status(201).json({ success: true, message: 'Mensaje creado', id: result.insertId });
  } catch (error) {
    console.error('❌ [createMessage] Error al guardar mensaje:', error);
    res.status(500).json({ success: false, message: 'Error al guardar mensaje' });
  }
};

/**
 * GET /api/messages/expired
 */
export const getExpiredMessages = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM messages
      WHERE expiration_date < CURDATE()
      ORDER BY expiration_date DESC
    `);

    const parsedRows = rows.map(row => ({
      ...row,
      recipients: (() => {
        try {
          return JSON.parse(row.recipients);
        } catch {
          console.warn(`⚠️ Recipients inválido en mensaje ID ${row.id}:`, row.recipients);
          return [row.recipients];
        }
      })()
    }));

    res.json({ success: true, data: parsedRows });
  } catch (error) {
    console.error('❌ [getExpiredMessages] Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mensajes vencidos' });
  }
};


/**
 * PUT /api/messages/:id
 */
export const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { subject, content, recipients, status, publication_date, expiration_date } = req.body;

  console.log('✏️ [updateMessage] ID:', id);
  console.log('✏️ [updateMessage] Datos:', req.body);

  if (!subject || !content || !recipients?.length || !publication_date || !expiration_date) {
    console.warn('⚠️ [updateMessage] Faltan campos obligatorios para editar');
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para editar' });
  }

  try {
    const [result] = await db.query(
      `UPDATE messages
       SET subject = ?, content = ?, recipients = ?, status = ?, publication_date = ?, expiration_date = ?
       WHERE id = ?`,
      [
        subject,
        content,
        JSON.stringify(recipients),
        status || 'sent',
        publication_date,
        expiration_date,
        id
      ]
    );

    if (result.affectedRows === 0) {
      console.warn('⚠️ [updateMessage] Mensaje no encontrado para ID:', id);
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    }

    console.log('✅ [updateMessage] Mensaje actualizado');
    res.json({ success: true, message: 'Mensaje actualizado' });
  } catch (error) {
    console.error('❌ [updateMessage] Error al actualizar mensaje:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar mensaje' });
  }
};

/**
 * DELETE /api/messages/:id
 */
export const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM messages WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      console.warn('⚠️ [deleteMessage] Mensaje no encontrado para ID:', id);
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    }

    console.log(`🗑️ [deleteMessage] Mensaje ID ${id} eliminado`);
    res.json({ success: true, message: 'Mensaje eliminado' });
  } catch (error) {
    console.error('❌ [deleteMessage] Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar mensaje' });
  }
};

