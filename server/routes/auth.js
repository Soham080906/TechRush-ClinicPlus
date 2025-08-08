const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization, licenseNumber, experience, education, phone, clinic } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // Validate role
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "patient" or "doctor"' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    // If registering as a doctor, create doctor profile
    if (role === 'doctor') {
      const doctorData = {
        name,
        specialization: specialization || 'General Physician',
        licenseNumber: licenseNumber || 'Not provided',
        experience: parseInt(experience) || 0,
        education: education || 'Not provided',
        phone: phone || 'Not provided',
        clinic: clinic || null,
        user: user._id,
        availableSlots: []
      };

      const doctor = new Doctor(doctorData);
      await doctor.save();
    }

    res.json({ message: 'User registered successfully', role });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Optional role validation (if provided)
    if (role && user.role !== role) {
      return res.status(401).json({ error: `Invalid role. Expected: ${role}, Found: ${user.role}` });
    }

    // Get doctor profile if user is a doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id }).populate('clinic');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      doctorProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

module.exports = router;