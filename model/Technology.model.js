// models/Technology.js
import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

// Add virtual id field and toJSON transformation
technologySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id; // Add virtual id
    delete ret._id;
  },
});

export default mongoose.model('Technology', technologySchema);
