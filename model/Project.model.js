import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  technical_stack: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  members_needed: {
    type: Number,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technologies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technology',
    },
  ],
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});
  
const Project = mongoose.model('Project', projectSchema);
export default Project;
