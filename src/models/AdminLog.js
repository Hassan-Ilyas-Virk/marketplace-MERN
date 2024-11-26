import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('AdminLog', adminLogSchema);