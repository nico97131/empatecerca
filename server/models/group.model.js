import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  discipline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discipline',
    required: true
  },
  maxMembers: {
    type: Number,
    required: [true, 'Please add maximum members']
  },
  schedule: {
    type: String,
    required: [true, 'Please add a schedule']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current members count
groupSchema.virtual('currentMembers').get(function() {
  return this.students.length;
});

const Group = mongoose.model('Group', groupSchema);

export default Group;