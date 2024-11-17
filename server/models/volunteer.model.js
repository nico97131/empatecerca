import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  availability: [{
    type: String
  }],
  activeGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;