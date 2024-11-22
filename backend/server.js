// Import required modules
const express = require('express');
const connectDB = require('./database');
const User = require('./models/User');
const Contribution = require('./models/Contribution');
const bcrypt = require('bcryptjs'); // Removed duplicate bcrypt declaration
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // For validation

// Initialize Express app
const app = express();

// Secret for JWT
const JWT_SECRET = 'your-secret-key';

// Middleware to parse JSON data
app.use(express.json());

// Connect to MongoDB
connectDB();

// Root route for testing
app.get('/', (req, res) => {
    res.send('Lucky you!! The database - GitRewards - is working perfectly well!!');
});

// -------------------------- Validation Schema --------------------------

// User validation schema
const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    location: Joi.string().optional(),
    schoolOrCollege: Joi.string().optional(),
    linkedinProfile: Joi.string().uri().optional(),
    githubProfile: Joi.string().uri().optional(),
    twitterProfile: Joi.string().uri().optional(),
});

// Middleware to validate input
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};

// -------------------------- User Routes --------------------------

// Create a new user
app.post('/api/users', validateUser, async (req, res) => {
    try {
        const { username, email, password, location, schoolOrCollege, linkedinProfile, githubProfile, twitterProfile } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Save hashed password
            location,
            schoolOrCollege,
            linkedinProfile,
            githubProfile,
            twitterProfile,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude the password field for security
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// Update user data
app.put('/api/users/:userId', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            req.body,
            { new: true } // Returns the updated document
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});


// Delete a user and their contributions
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete contributions
    await Contribution.deleteMany({ userId: req.params.userId });

    // Delete the user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User and their contributions deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// -------------------------- Authentication --------------------------

// Login route (authentication)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(401).json({ message: 'Invalid credentials' });

        // Generate a token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// -------------------------- Contribution Routes --------------------------

// Create a new contribution
app.post('/api/contributions', async (req, res) => {
    try {
        const { userId, repoName, contributionType } = req.body;
        const newContribution = new Contribution({ userId, repoName, contributionType });
        await newContribution.save();
        res.status(201).json(newContribution);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Fetch all contributions by a specific user
app.get('/api/users/:userId/contributions', async (req, res) => {
    try {
        const userId = req.params.userId;
        const contributions = await Contribution.find({ userId });
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contributions', error });
    }
});

// Get all contributions
app.get('/api/contributions', async (req, res) => {
    try {
        const contributions = await Contribution.find().populate('userId', 'username email');
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------- Start the Server --------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});