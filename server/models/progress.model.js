import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  attendance: {
    type: Boolean,
    required: true
  },
  performance: {
    type: String,
    enum: ['Excelente', 'Bueno', 'Regular', 'Necesita Mejorar'],
    required: true
  },
  activities: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;