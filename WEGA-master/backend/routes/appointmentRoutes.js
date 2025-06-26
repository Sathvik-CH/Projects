// routes/appointmentRoutes.js
const express = require('express');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Route for booking an appointment
router.post('/book', async (req, res) => {
    const { userId, date, doctor, additionalInfo } = req.body;

    // Validate required fields
    if (!userId || !date || !doctor) {
        return res.status(400).json({ message: 'Please provide user ID, date, and doctor.' });
    }

    try {
        // Create a new appointment
        const newAppointment = new Appointment({
            userId,
            date,
            doctor,
            additionalInfo
        });

        // Save the appointment in the database
        await newAppointment.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (err) {
        console.error('Error booking appointment:', err);
        res.status(500).json({ message: 'Failed to book appointment', error: err.message });
    }
});

module.exports = router;
