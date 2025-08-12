const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const nodemailer = require('nodemailer');

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

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in user document with expiration (15 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Send OTP via email
        try {
            // Create transporter (using Gmail for demo - you can change this)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'your-email@gmail.com',
                    pass: process.env.EMAIL_PASS || 'your-app-password'
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset OTP - ClinicPlus',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Password Reset Request</h2>
                        <p>Hello ${user.name},</p>
                        <p>You have requested to reset your password. Use the following OTP to proceed:</p>
                        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                        </div>
                        <p><strong>This OTP will expire in 15 minutes.</strong></p>
                        <p>If you didn't request this password reset, please ignore this email.</p>
                        <p>Best regards,<br>ClinicPlus Team</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            
            res.json({ 
                message: 'OTP sent successfully to your email',
                email: email // Return email for frontend use
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Remove OTP if email fails
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password - Verify OTP and Update Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if OTP exists and is valid
        if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check if OTP has expired
        if (user.resetPasswordExpires < Date.now()) {
            // Clear expired OTP
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password and clear OTP
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;