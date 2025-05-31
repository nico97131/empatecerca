import db from '../config/db.js';

// @desc Obtener todos los mensajes para un usuario
// @desc Obtener todos los mensajes para un usuario (por ID y rol)
export const getMessagesForUser = async (req, res) => {
  const { user_id, user_role } = req.query;

  if (!user_id || !user_role) {
    return res.status(400).json({ error: 'ID y rol requeridos' });
  }

  try {
    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (from_id = ? AND from_role = ?)
          OR (to_id = ? AND to_role = ?)
       ORDER BY timestamp ASC`,
      [user_id, user_role, user_id, user_role]
    );

    res.json({ data: messages });
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// @desc Crear un nuevo mensaje
export const createMessage = async (req, res) => {
  const { from_id, from_role, to_id, to_role, content } = req.body;

  if (!from_id || !from_role || !to_id || !to_role || !content) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO messages (from_id, from_role, to_id, to_role, content) 
       VALUES (?, ?, ?, ?, ?)`,
      [from_id, from_role, to_id, to_role, content]
    );

    const [newMessage] = await db.query(
      `SELECT * FROM messages WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Mensaje enviado', data: newMessage[0] });
  } catch (error) {
    console.error('❌ Error al crear mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

// (Opcional) Marcar como leído
// @desc Marcar como leídos todos los mensajes entre dos usuarios
export const markMessagesAsRead = async (req, res) => {
  const { to_id, to_role, from_id, from_role } = req.body;

  if (!to_id || !to_role || !from_id || !from_role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE to_id = ? AND to_role = ? AND from_id = ? AND from_role = ? AND is_read = FALSE`,
      [to_id, to_role, from_id, from_role]
    );

    console.log(`✅ ${result.affectedRows} mensajes marcados como leídos`);
    res.status(200).json({ message: 'Mensajes marcados como leídos', updated: result.affectedRows });
  } catch (error) {
    console.error('❌ Error al marcar mensajes como leídos:', error);
    res.status(500).json({ error: 'Error al actualizar mensajes' });
  }
};
