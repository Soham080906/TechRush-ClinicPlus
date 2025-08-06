const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  availableSlots: [Date]
});

module.exports = mongoose.model('Doctor', doctorSchema);