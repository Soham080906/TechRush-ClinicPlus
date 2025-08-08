const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Book appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctor, clinic, slot, notes } = req.body;
    
    // Validate required fields
    if (!doctor || !clinic || !slot) {
      return res.status(400).json({ error: 'Doctor, clinic, and slot are required' });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({ 
      doctor, 
      slot,
      status: { $ne: 'cancelled' }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: req.user.id,
      doctor,
      clinic,
      slot: new Date(slot),
      notes: notes || '',
      status: 'booked'
    });

    await appointment.save();
    
    // Populate doctor and clinic info for response
    await appointment.populate('doctor clinic');
    
    res.json({ 
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: 'Failed to book appointment: ' + error.message });
  }
});

// Get user's appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patient: req.user.id 
    })
    .populate('doctor', 'name specialization')
    .populate('clinic', 'name location')
    .sort({ slot: 1 }); // Sort by appointment time

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments for a specific doctor (for doctor dashboard)
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctor: req.params.doctorId 
    })
    .populate('patient', 'name email')
    .populate('clinic', 'name location')
    .sort({ slot: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['booked', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('doctor clinic');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ 
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user owns the appointment or is the doctor
    if (appointment.patient.toString() !== req.user.id && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

module.exports = router;