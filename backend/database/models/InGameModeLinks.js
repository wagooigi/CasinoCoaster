const mongoose = require('mongoose');

const inGameModeLinksSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    links: {
        CombatLegend: { type: String}
    },
    uid: {
        CombatLegend: { type: String}
    }
});

module.exports = mongoose.model('InGameModeLinks',  inGameModeLinksSchema);
