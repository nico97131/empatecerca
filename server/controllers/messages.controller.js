import db from '../config/db.js';

// @desc Obtener todos los mensajes para un usuario, buscando por DNI en la tabla users2
export const getMessagesForUser = async (req, res) => {
  const { user_dni, user_role } = req.query;

  if (!user_dni || !user_role) {
    return res.status(400).json({ error: 'DNI y rol requeridos' });
  }

  try {
    const [authRows] = await db.query(
      `SELECT id FROM users2 WHERE dni = ? AND role = ? LIMIT 1`,
  [user_dni, user_role] // ✅ Ahora pasás los dos parámetros
    );

    if (authRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en users2 por DNI' });
    }

    const authId = authRows[0].id;

    const [messages] = await db.query(
      `
      SELECT
        m.id,
        m.from_id,
        u_from.dni AS from_dni,
        m.from_role,
        m.to_id,
        u_to.dni AS to_dni,
        m.to_role,
        m.content,
        m.timestamp,
        m.is_read
      FROM messages AS m
      JOIN users2 AS u_from ON u_from.id = m.from_id
      JOIN users2 AS u_to   ON u_to.id   = m.to_id
      WHERE 
        (m.from_id = ? AND m.from_role = ?)
        OR
        (m.to_id = ? AND m.to_role = ?)
      ORDER BY m.timestamp ASC
      `,
      [authId, user_role, authId, user_role]
    );

    return res.json({ data: messages });
  } catch (error) {
    console.error('❌ Error al obtener mensajes por DNI desde users2:', error);
    return res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// @desc Crear un nuevo mensaje (los IDs se obtienen a partir de los DNI)
export const createMessage = async (req, res) => {
  const { from_dni, from_role, to_dni, to_role, content } = req.body;

  if (!from_dni || !from_role || !to_dni || !to_role || !content) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
const [[fromUser]] = await db.query('SELECT id FROM users2 WHERE dni = ? AND role = ?', [from_dni, from_role]);
const [[toUser]] = await db.query('SELECT id FROM users2 WHERE dni = ? AND role = ?', [to_dni, to_role]);


    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'No se encontró alguno de los usuarios en users2' });
    }

    const from_id = fromUser.id;
    const to_id = toUser.id;

    const [result] = await db.query(
      `INSERT INTO messages (from_id, from_role, to_id, to_role, content) 
       VALUES (?, ?, ?, ?, ?)`,
      [from_id, from_role, to_id, to_role, content]
    );

    const newMessageId = result.insertId;

    const [newMessageRows] = await db.query(
      `
      SELECT
        m.id,
        m.from_id,
        u_from.dni AS from_dni,
        m.from_role,
        m.to_id,
        u_to.dni AS to_dni,
        m.to_role,
        m.content,
        m.timestamp,
        m.is_read
      FROM messages AS m
      JOIN users2 AS u_from ON u_from.id = m.from_id
      JOIN users2 AS u_to   ON u_to.id   = m.to_id
      WHERE m.id = ?
      `,
      [newMessageId]
    );

    return res.status(201).json({ message: 'Mensaje enviado', data: newMessageRows[0] });
  } catch (error) {
    console.error('❌ Error al crear mensaje (users2):', error);
    return res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

// @desc Marcar mensajes como leídos
export const markMessagesAsRead = async (req, res) => {
  const { to_id, to_role, from_id, from_role } = req.body;

  if (!to_id || !to_role || !from_id || !from_role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE to_id = ? 
        AND to_role = ? 
        AND from_id = ? 
        AND from_role = ? 
        AND is_read = FALSE
      `,
      [to_id, to_role, from_id, from_role]
    );

    console.log(`✅ ${result.affectedRows} mensajes marcados como leídos`);
    return res.status(200).json({ message: 'Mensajes marcados como leídos', updated: result.affectedRows });
  } catch (error) {
    console.error('❌ Error al marcar mensajes como leídos:', error);
    return res.status(500).json({ error: 'Error al actualizar mensajes' });
  }
};
