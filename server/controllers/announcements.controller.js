import db from '../config/db.js';

/**
 * GET /api/announcements
 */
export const getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM announcements
      WHERE expiration_date >= CURDATE()
      ORDER BY publication_date DESC
    `);
    const parsedRows = rows.map(row => ({
      ...row,
      recipients: (() => {
        try {
          const parsed = JSON.parse(row.recipients);
          if (!Array.isArray(parsed)) throw new Error();
          return parsed;
        } catch {
          console.warn(`⚠️ Recipients inválido en mensaje ID ${row.id}:`, row.recipients);
          return [row.recipients];
        }
      })()

    }));

    res.json({ success: true, data: parsedRows });
  } catch (error) {
    console.error('❌ [getAnnouncements] Error:', error);
    res.status(500).json({ success: false, announcement: 'Error al obtener mensajes' });
  }
};

/**
 * POST /api/announcements
 */
export const createAnnouncement = async (req, res) => {
  const { subject, content, recipients, status, publication_date, expiration_date } = req.body;

  console.log('📨 [createAnnouncement] Datos recibidos:', req.body);

  if (!subject || !content || !recipients?.length || !publication_date || !expiration_date) {
    console.warn('⚠️ [createAnnouncement] Faltan campos obligatorios');
    return res.status(400).json({ success: false, announcement: 'Faltan campos obligatorios' });
  }

  try {
    // Validar destinatarios permitidos
    const validRecipients = ['voluntarios', 'tutores', 'todos'];
    const invalid = recipients.some(r => typeof r !== 'string' || !validRecipients.includes(r));
    if (invalid) {
      return res.status(400).json({ success: false, announcement: 'Destinatarios inválidos' });
    }

    const [result] = await db.query(
      `INSERT INTO announcements (subject, content, recipients, status, publication_date, expiration_date)
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

    console.log('✅ [createAnnouncement] Mensaje insertado con ID:', result.insertId);
    res.status(201).json({ success: true, announcement: 'Mensaje creado', id: result.insertId });
  } catch (error) {
    console.error('❌ [createAnnouncement] Error al guardar mensaje:', error);
    res.status(500).json({ success: false, announcement: 'Error al guardar mensaje' });
  }
};

/**
 * GET /api/announcements/expired
 */
export const getExpiredAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM announcements
      WHERE expiration_date < CURDATE()
      ORDER BY expiration_date DESC
    `);

    const parsedRows = rows.map(row => ({
      ...row,
      recipients: (() => {
        try {
          const parsed = JSON.parse(row.recipients);
          if (!Array.isArray(parsed)) throw new Error();
          return parsed;
        } catch {
          console.warn(`⚠️ Recipients inválido en mensaje ID ${row.id}:`, row.recipients);
          return [row.recipients];
        }
      })()

    }));

    res.json({ success: true, data: parsedRows });
  } catch (error) {
    console.error('❌ [getExpiredAnnouncements] Error:', error);
    res.status(500).json({ success: false, announcement: 'Error al obtener mensajes vencidos' });
  }
};


/**
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { subject, content, recipients, status, publication_date, expiration_date } = req.body;

  console.log('✏️ [updateAnnouncement] ID:', id);
  console.log('✏️ [updateAnnouncement] Datos:', req.body);

  if (!subject || !content || !recipients?.length || !publication_date || !expiration_date) {
    console.warn('⚠️ [updateAnnouncement] Faltan campos obligatorios para editar');
    return res.status(400).json({ success: false, announcement: 'Faltan campos obligatorios para editar' });
  }

  try {
    // Validar destinatarios permitidos
    const validRecipients = ['voluntarios', 'tutores', 'todos'];
    const invalid = recipients.some(r => typeof r !== 'string' || !validRecipients.includes(r));
    if (invalid) {
      return res.status(400).json({ success: false, announcement: 'Destinatarios inválidos' });
    }

    const [result] = await db.query(
      `UPDATE announcements
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
      console.warn('⚠️ [updateAnnouncement] Mensaje no encontrado para ID:', id);
      return res.status(404).json({ success: false, announcement: 'Mensaje no encontrado' });
    }

    console.log('✅ [updateAnnouncement] Mensaje actualizado');
    res.json({ success: true, announcement: 'Mensaje actualizado' });
  } catch (error) {
    console.error('❌ [updateAnnouncement] Error al actualizar mensaje:', error);
    res.status(500).json({ success: false, announcement: 'Error al actualizar mensaje' });
  }
};

/**
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM announcements WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      console.warn('⚠️ [deleteAnnouncement] Mensaje no encontrado para ID:', id);
      return res.status(404).json({ success: false, announcement: 'Mensaje no encontrado' });
    }

    console.log(`🗑️ [deleteAnnouncement] Mensaje ID ${id} eliminado`);
    res.json({ success: true, announcement: 'Mensaje eliminado' });
  } catch (error) {
    console.error('❌ [deleteAnnouncement] Error:', error);
    res.status(500).json({ success: false, announcement: 'Error al eliminar mensaje' });
  }
};

