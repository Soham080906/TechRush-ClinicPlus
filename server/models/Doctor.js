const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  licenseNumber: String,
  experience: Number, // Years of experience
  education: String,
  phone: String,
  availableSlots: [Date],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Doctor', doctorSchema);