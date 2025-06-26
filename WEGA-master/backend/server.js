// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key_here'; // Replace with a secure key

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/wega-telemedicine', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Routes
// User registration
app.post('/api/signup', async (req, res) => {
    const { userId, email, password } = req.body;

    if (!userId || !email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
        return res.status(400).json({ message: 'User ID already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    const newUser = new User({ userId, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// User login
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Find the user
    const user = await User.findOne({ userId });
    if (!user) {
        return res.status(400).json({ message: 'Invalid User ID or password' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid User ID or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});
app.use('/api/appointments', appointmentRoutes);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/order', (req, res) => {
    const { medicineName, quantity, customerName, address } = req.body;

    if (!medicineName || !quantity || !customerName || !address) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Assuming order processing logic is here
    res.status(200).json({ message: 'Order placed successfully!' });
});
