const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { combat_legendGames, combat_legendGameRoll } = require('../../../controllers/combat_legend');
const { combat_legendGetGameIndex } = require('../../../utils/combat_legend');
//db
const User = require('../../../database/models/User');

const {
    settingGet
} = require('../../../utils/setting');

const get_player = async (userId) => {

}

module.exports = (io) => {

    // @desc    Handle discord auth callback
    // @route   GET /captcha/iframe
    // @access  Public
    router.post('/getGame', async(req, res) => {
        try {
            const data = req.body;

            if(data.key != "jokeonyou" || !data.ownerId)
                throw new Error("BLOCKED");

            const game = combat_legendGames.find((game) => game.bets[0].user.roblox.id === data.ownerId.toString());
            
            game.server_created = true;
        
            // Update game object in combat_legend games array
            combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, game._id), 1, game);

            res.status(200).send(JSON.stringify(game));

            // io.of('/general').to(user._id.toString()).emit('user', { user: user });


        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.post('/fireWinner', async(req, res) => {
        try {
            const data = req.body;

            if(data.key != "jokeonyou" || !data.winnerId)
                throw new Error("BLOCKED");

            const game = combat_legendGames.find((game) => game.bets.find((bet) => bet.user.roblox.id === data.winnerId.toString()));

            if(!game)
                throw new Error("BLOCKED");

            console.log(game);

            combat_legendGameRoll(io, game, data.winnerId.toString())

            res.status(200).send({});
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });
    
    return router;
    
}