const mongoose = require('mongoose');

const combat_legendGameSchema = new mongoose.Schema({
    amount: { type: Number },
    playerCount: { type: Number },
    winner: { type: mongoose.Schema.ObjectId, ref: 'Combat_legendBet' },
    fair: {
        seedServer: { type: String },
        hash: { type: String },
        seedPublic: { type: String },
        blockId: { type: String }
    },
    roblox_server_link: {type: String},
    robloxStartTime: {type: Object},
    server_created: {type: Boolean},
    state: { type: String },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Reverse populate with virtuals
combat_legendGameSchema.virtual('bets', {
    ref: 'Combat_legendBet',
    localField: '_id',
    foreignField: 'game',
    justOne: false
});

module.exports = mongoose.model('Combat_legendGame', combat_legendGameSchema);
