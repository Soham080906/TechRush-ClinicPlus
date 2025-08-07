const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Get all doctors with clinic and user info
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('clinic')
      .populate('user', 'name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('clinic')
      .populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Add new doctor (for admin use)
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.json({ message: 'Doctor added successfully', doctor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

// Update doctor profile
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('clinic');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// Get doctor by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId })
      .populate('clinic')
      .populate('user', 'name email');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
});

// Update doctor's own profile (authenticated)
router.put('/profile/me', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['specialization', 'licenseNumber', 'experience', 'education', 'phone', 'clinic'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      updates,
      { new: true }
    ).populate('clinic');

    res.json({ 
      message: 'Profile updated successfully', 
      doctor: updatedDoctor 
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update doctor's available slots
router.put('/:id/slots', auth, async (req, res) => {
  try {
    const { availableSlots } = req.body;
    
    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({ error: 'Available slots must be an array' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availableSlots: availableSlots.map(slot => new Date(slot)) },
      { new: true }
    ).populate('clinic');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ 
      message: 'Available slots updated successfully', 
      doctor 
    });
  } catch (error) {
    console.error('Error updating available slots:', error);
    res.status(500).json({ error: 'Failed to update available slots' });
  }
});

// Get doctor's available slots
router.get('/:id/slots', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('availableSlots');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ availableSlots: doctor.availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

module.exports = router;