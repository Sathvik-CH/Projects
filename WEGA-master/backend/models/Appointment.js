// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Reference to the user who booked the appointment
    date: { type: String, required: true }, // Appointment date
    doctor: { type: String, required: true }, // Selected doctor
    additionalInfo: { type: String } // Optional information
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
