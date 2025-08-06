const express = require('express');
const Clinic = require('../models/Clinic');
const router = express.Router();

router.get('/', async (req, res) => {
  const clinics = await Clinic.find();
  res.json(clinics);
});

router.post('/', async (req, res) => {
  const clinic = new Clinic(req.body);
  await clinic.save();
  res.send('Clinic added');
});

module.exports = router;