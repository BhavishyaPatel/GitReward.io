const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://bhavishyakpatel:VuHKkKkyqEN8ADaj@gitrewards.7lpwm.mongodb.net/?retryWrites=true&w=majority&appName=GitRewards', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
    }
}

module.exports = connectDB;
