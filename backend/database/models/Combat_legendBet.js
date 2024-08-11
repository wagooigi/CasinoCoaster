const mongoose = require('mongoose');

const combat_legendBetSchema = new mongoose.Schema({
    amount: { type: Number },
    payout: { type: Number },
    multiplier: { type: Number },
    roll: { type: Number },
    game: { type: mongoose.Schema.ObjectId, ref: 'Combat_legendGame' },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    bot: { type: Boolean },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Combat_legendBet', combat_legendBetSchema);
