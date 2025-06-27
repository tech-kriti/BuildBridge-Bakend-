import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
  },
  proficiencyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
