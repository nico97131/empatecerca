//import Progress from '../models/progress.model.js';

// @desc    Get all progress records
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate('student', 'name')
      .populate('volunteer', 'name');

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get progress records for a specific student
// @route   GET /api/progress/student/:studentId
// @access  Private
export const getStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.params.studentId })
      .populate('volunteer', 'name')
      .sort('-date');

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get progress records for a specific group
// @route   GET /api/progress/group/:groupId
// @access  Private
export const getGroupProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate({
        path: 'student',
        match: { group: req.params.groupId },
        select: 'name'
      })
      .populate('volunteer', 'name')
      .sort('-date');

    // Filtrar registros donde student no es null (pertenece al grupo)
    const filteredProgress = progress.filter(p => p.student !== null);

    res.json({
      success: true,
      count: filteredProgress.length,
      data: filteredProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create progress record
// @route   POST /api/progress
// @access  Private/Volunteer,Admin
export const createProgress = async (req, res) => {
  try {
    // Agregar el voluntario actual como el creador del registro
    const progress = await Progress.create({
      ...req.body,
      volunteer: req.user.id
    });

    res.status(201).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update progress record
// @route   PUT /api/progress/:id
// @access  Private/Volunteer,Admin
export const updateProgress = async (req, res) => {
  try {
    let progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Verificar que el voluntario sea el creador del registro o sea admin
    if (progress.volunteer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this progress record'
      });
    }

    progress = await Progress.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete progress record
// @route   DELETE /api/progress/:id
// @access  Private/Volunteer,Admin
export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Verificar que el voluntario sea el creador del registro o sea admin
    if (progress.volunteer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this progress record'
      });
    }

    await progress.deleteOne();

    res.json({
      success: true,
      message: 'Progress record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};