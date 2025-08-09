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

    // Validate that appointment is not for today or in the past
    const appointmentDate = new Date(slot);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate <= today) {
      return res.status(400).json({ error: 'Appointments cannot be booked for today or past dates' });
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

// Get booked slots for a specific doctor and date
router.get('/booked-slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    console.log('Fetching booked slots for doctorId:', doctorId, 'date:', date);
    
    // Validate date format
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Create start and end of the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find all appointments for this doctor on this date (excluding cancelled)
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      slot: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });
    
    console.log('Found appointments (excluding cancelled):', bookedAppointments.length);
    
    // Extract the time slots that are booked
    const bookedSlots = bookedAppointments.map(appointment => {
      const slotTime = new Date(appointment.slot);
      // Check if the date is valid
      if (isNaN(slotTime.getTime())) {
        console.warn('Invalid date found in appointment:', appointment._id);
        return null;
      }
      return slotTime.toTimeString().slice(0, 5); // Format as HH:MM
    }).filter(slot => slot !== null); // Remove invalid slots
    
    console.log('Booked slots returned:', bookedSlots);
    
    res.json({ bookedSlots });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

// Get appointments for a specific doctor (for doctor dashboard)
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query; // Optional status filter
    
    console.log('Fetching appointments for doctorId:', doctorId, 'with status filter:', status);
    
    // First, try to find doctor by User ID, then by Doctor ID
    let actualDoctorId = doctorId;
    
    // Check if the doctorId is a User ID and find the corresponding Doctor
    const Doctor = require('../models/Doctor');
    const doctorRecord = await Doctor.findOne({ user: doctorId });
    if (doctorRecord) {
      actualDoctorId = doctorRecord._id;
      console.log('Found doctor record:', actualDoctorId, 'for user:', doctorId);
    } else {
      console.log('No doctor record found for user ID, trying as direct doctor ID:', doctorId);
    }

    // Build query with the correct doctor ID
    let query = { doctor: actualDoctorId };
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $ne: 'cancelled' };
      } else {
        query.status = status;
      }
    }

    console.log('Final query:', query);

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('clinic', 'name location')
      .populate('doctor', 'name specialization')
      .sort({ slot: 1 });

    console.log('Found appointments:', appointments.length);

    // Add appointment type for better categorization
    const appointmentsWithType = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      appointmentObj.appointmentType = appointment.status === 'cancelled' ? 'cancelled' : 'active';
      return appointmentObj;
    });

    res.json(appointmentsWithType);
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

// Update appointment status (specific endpoint for status updates)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this appointment status' });
    }

    appointment.status = status;
    await appointment.save();

    // Populate for response
    await appointment.populate('patient', 'name email');
    await appointment.populate('clinic', 'name location');

    res.json({ 
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
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

// Cancel appointment (PUT method for frontend compatibility)
router.put('/:id/cancel', auth, async (req, res) => {
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