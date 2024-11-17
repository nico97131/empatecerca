import Discipline from '../models/discipline.model.js';

// @desc    Get all disciplines
// @route   GET /api/disciplines
// @access  Private
export const getDisciplines = async (req, res) => {
  try {
    const disciplines = await Discipline.find();
    res.json({
      success: true,
      count: disciplines.length,
      data: disciplines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single discipline
// @route   GET /api/disciplines/:id
// @access  Private
export const getDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.findById(req.params.id);
    if (!discipline) {
      return res.status(404).json({
        success: false,
        message: 'Discipline not found'
      });
    }
    res.json({
      success: true,
      data: discipline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create discipline
// @route   POST /api/disciplines
// @access  Private/Admin
export const createDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.create(req.body);
    res.status(201).json({
      success: true,
      data: discipline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update discipline
// @route   PUT /api/disciplines/:id
// @access  Private/Admin
export const updateDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!discipline) {
      return res.status(404).json({
        success: false,
        message: 'Discipline not found'
      });
    }

    res.json({
      success: true,
      data: discipline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete discipline
// @route   DELETE /api/disciplines/:id
// @access  Private/Admin
export const deleteDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.findByIdAndDelete(req.params.id);
    
    if (!discipline) {
      return res.status(404).json({
        success: false,
        message: 'Discipline not found'
      });
    }

    res.json({
      success: true,
      message: 'Discipline deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};