const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repoName: { type: String, required: true },
    contributionType: { type: String, required: true }, // e.g., "pull request", "issue"
    status: { type: String, default: 'pending' },
    rewardPoints: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contribution', contributionSchema);
