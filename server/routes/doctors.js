const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

router.get('/', async (req, res) => {
  const doctors = await Doctor.find().populate('clinic');
  res.json(doctors);
});

router.post('/', async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.send('Doctor added');
});

module.exports = router;