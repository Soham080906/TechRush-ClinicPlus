const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: String,
  location: String
});

module.exports = mongoose.model('Clinic', clinicSchema);