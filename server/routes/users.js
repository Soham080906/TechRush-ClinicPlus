const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is a doctor, include doctor profile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id }).populate('clinic');
    }

    res.json({ 
      user,
      doctorProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
      user.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is a doctor, also delete doctor profile
    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get user statistics (for dashboard)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stats = {
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0
    };

    // Import Appointment model here to avoid circular dependency
    const Appointment = require('../models/Appointment');

    if (user.role === 'patient') {
      // Patient statistics
      const appointments = await Appointment.find({ patient: user._id });
      
      stats.totalAppointments = appointments.length;
      stats.upcomingAppointments = appointments.filter(apt => 
        apt.status === 'booked' && new Date(apt.slot) > new Date()
      ).length;
      stats.completedAppointments = appointments.filter(apt => 
        apt.status === 'completed'
      ).length;
      stats.cancelledAppointments = appointments.filter(apt => 
        apt.status === 'cancelled'
      ).length;
    } else if (user.role === 'doctor') {
      // Doctor statistics
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        const appointments = await Appointment.find({ doctor: doctor._id });
        
        stats.totalAppointments = appointments.length;
        stats.upcomingAppointments = appointments.filter(apt => 
          apt.status === 'booked' && new Date(apt.slot) > new Date()
        ).length;
        stats.completedAppointments = appointments.filter(apt => 
          apt.status === 'completed'
        ).length;
        stats.cancelledAppointments = appointments.filter(apt => 
          apt.status === 'cancelled'
        ).length;
      }
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 