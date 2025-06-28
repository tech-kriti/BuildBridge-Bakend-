import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution_name: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  field_of_study: {
    type: String,
    default: '',
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
   toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id; // Add virtual id
        delete ret._id;
      },
    },
});

const Education = mongoose.model('Education', educationSchema);
export default Education;
