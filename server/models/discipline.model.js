import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  difficulty: {
    type: String,
    enum: ['Básico', 'Intermedio', 'Avanzado'],
    required: true
  },
  prerequisites: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for groups count
disciplineSchema.virtual('groupsCount', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'discipline',
  count: true
});

const Discipline = mongoose.model('Discipline', disciplineSchema);

export default Discipline;