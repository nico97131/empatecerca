import Group from '../models/group.model.js';

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('discipline', 'name')
      .populate('volunteer', 'name email')
      .populate('students', 'name');

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('discipline', 'name')
      .populate('volunteer', 'name email')
      .populate('students', 'name');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create group
// @route   POST /api/groups
// @access  Private/Admin
export const createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private/Admin
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private/Admin
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add student to group
// @route   POST /api/groups/:id/students
// @access  Private/Admin
export const addStudentToGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Verificar si el grupo está lleno
    if (group.students.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is at maximum capacity'
      });
    }

    // Verificar si el estudiante ya está en el grupo
    if (group.students.includes(req.body.studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already in this group'
      });
    }

    group.students.push(req.body.studentId);
    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove student from group
// @route   DELETE /api/groups/:id/students/:studentId
// @access  Private/Admin
export const removeStudentFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Verificar si el estudiante está en el grupo
    const studentIndex = group.students.indexOf(req.params.studentId);
    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Student is not in this group'
      });
    }

    group.students.splice(studentIndex, 1);
    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};