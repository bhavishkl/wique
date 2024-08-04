import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'business', 'admin'],
    default: 'user',
  },
  queueHistory: [{
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  favoriteQueues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
  }],
  notifications: [{
    type: String,
    message: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
  }],
});

export default mongoose.models.User || mongoose.model('User', UserSchema);