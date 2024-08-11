const mongoose = require('mongoose');

const slotsUser = new mongoose.Schema({
    "Id": "noname",
    "Nick": "Noname",
    amount: { type: Number },
    data: {
        providerId: { type: String },
        transaction: { type: String },
        sender: { type: String },
        receiver: { type: String },
        currency: { type: String },
        cryptoAmount: { type: Number }
    },
    type: { type: String },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    state: { type: String },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SlotsUser',  slotsUser);
