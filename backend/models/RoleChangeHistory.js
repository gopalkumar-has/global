
const mongoose = require('mongoose');

const roleChangeHistorySchema = new mongoose.Schema({
  targetUserId: {
    type: String,
    required: true,
    index: true
  },
  targetName: {
    type: String,
    default: ''
  },
  oldRole: {
    type: String,
    required: true
  },
  newRole: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    default: ''
  },
  adminName: {
    type: String,
    default: ''
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model(
  'RoleChangeHistory',
  roleChangeHistorySchema
);
