import Volunteer from '../models/volunteer.model.js';
import Group from '../models/group.model.js';

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Private/Admin
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', '-password');
    res.json({
      success: true,
      count: volunteers.length,
      data: volunteers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private
export const getVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('user', '-password');
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create volunteer
// @route   POST /api/volunteers
// @access  Private/Admin
export const createVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update volunteer
// @route   PUT /api/volunteers/:id
// @access  Private/Admin
export const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete volunteer
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
export const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    res.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update volunteer availability
// @route   PUT /api/volunteers/:id/availability
// @access  Private/Admin/Volunteer
export const updateAvailability = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user.id !== volunteer.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this volunteer\'s availability'
      });
    }

    volunteer.availability = req.body.availability;
    await volunteer.save();

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get volunteer's groups
// @route   GET /api/volunteers/:id/groups
// @access  Private/Admin/Volunteer
export const getVolunteerGroups = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const groups = await Group.find({ volunteer: req.params.id });

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