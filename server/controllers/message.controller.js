//import Message from '../models/message.model.js';

// @desc    Get all messages for current user
// @route   GET /api/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    })
    .populate('from', 'name email role')
    .populate('to', 'name email role')
    .sort('-createdAt');

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private
export const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('from', 'name email role')
      .populate('to', 'name email role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verificar que el usuario sea el remitente o el destinatario
    if (message.from._id.toString() !== req.user.id && 
        message.to._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this message'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      from: req.user.id,
      ...req.body
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('from', 'name email role')
      .populate('to', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Solo el destinatario puede marcar como leído
    if (message.to.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    message.read = true;
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Solo el remitente o el destinatario pueden eliminar
    if (message.from.toString() !== req.user.id && 
        message.to.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread messages count
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};