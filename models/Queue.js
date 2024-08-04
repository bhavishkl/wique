import mongoose from 'mongoose';

const QueueSchema = new mongoose.Schema({
  queueUid: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  usersInLine: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedTime: {
      type: Date,
      default: Date.now,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open',
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: true,
  },
  categories: [{
    type: String,
    trim: true,
  }],
  operatingHours: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  estimatedServiceTime: {
    type: Number,
    required: true,
  },
  reviews: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

QueueSchema.index({ queueUid: 1 }, { unique: true });

const Queue = mongoose.models.Queue || mongoose.model('Queue', QueueSchema);

export default Queue;