const express = require('express');
const Clinic = require('../models/Clinic');
const router = express.Router();

// Get all clinics
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ name: 1 });
    res.json(clinics);
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
});

// Get clinic by ID
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// Add new clinic
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    
    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    // Check if clinic already exists
    const existingClinic = await Clinic.findOne({ 
      name: { $regex: new RegExp(name, 'i') },
      location: { $regex: new RegExp(location, 'i') }
    });

    if (existingClinic) {
      return res.status(400).json({ error: 'A clinic with this name and location already exists' });
    }

    const clinic = new Clinic({ name, location });
    await clinic.save();
    
    res.json({ 
      message: 'Clinic added successfully',
      clinic
    });
  } catch (error) {
    console.error('Error adding clinic:', error);
    res.status(500).json({ error: 'Failed to add clinic: ' + error.message });
  }
});

// Update clinic
router.put('/:id', async (req, res) => {
  try {
    const { name, location } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { name, location },
      { new: true }
    );

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json({ 
      message: 'Clinic updated successfully',
      clinic
    });
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ error: 'Failed to update clinic' });
  }
});

// Delete clinic
router.delete('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    res.status(500).json({ error: 'Failed to delete clinic' });
  }
});

module.exports = router;