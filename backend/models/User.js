const mongoose = require('mongoose');
const Contribution = require('./Contribution'); // Import the Contribution model

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: "" },
  schoolOrCollege: { type: String, default: "" },
  linkedinProfile: { type: String, default: "" },
  githubProfile: { type: String, default: "" },
  twitterProfile: { type: String, default: "" },
}, { timestamps: true });

// Middleware to delete contributions when a user is deleted
UserSchema.pre('remove', async function (next) {
  try {
    await Contribution.deleteMany({ userId: this._id }); // Delete all contributions of the user
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', UserSchema);
