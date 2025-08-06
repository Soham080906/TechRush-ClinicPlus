const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  const { doctor, clinic, slot } = req.body;
  const exists = await Appointment.findOne({ doctor, slot });
  if (exists) return res.status(400).send('Slot already booked');

  const appointment = new Appointment({
    patient: req.user.id,
    doctor,
    clinic,
    slot,
  });
  await appointment.save();
  res.send('Appointment booked');
});

router.get('/my', auth, async (req, res) => {
  const appts = await Appointment.find({ patient: req.user.id }).populate('doctor clinic');
  res.json(appts);
});

module.exports = router;