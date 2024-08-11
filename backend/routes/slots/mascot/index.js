const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


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
    router.post('/', async(req, res) => {
        try {
            const settings = settingGet();

            if(req.body.method == "getBalance"){
                const userId = mongoose.Types.ObjectId(req.body.params.playerName);

                const user = await User.findById(userId).select("balance").lean();

                const bal = user.balance / 10;

                res.status(200).json({
                    "jsonrpc": "2.0",
                    "id": 1928822492,
                    "result": {
                        "balance": Math.floor(bal)
                    }
                })
            }

            if(req.body.method == "withdrawAndDeposit"){
                const userId = mongoose.Types.ObjectId(req.body.params.playerName);

                let user = await User.findById(userId).lean()

                await User.findByIdAndUpdate(userId, {
                    "$inc" : {
                        balance: -req.body.params.withdraw*10,
                        xp: user.limits.blockSponsor !== true ? Math.floor(req.body.params.withdraw * 10 * settings.general.reward.multiplier) : 0
                    }
                })

                await User.findByIdAndUpdate(userId, {
                    "$inc" : {
                        balance: req.body.params.deposit*10
                    }
                })

                user = await User.findById(userId).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean();

                res.status(200).json({
                    "jsonrpc": "2.0",
                    "id": 1928822492,
                    "result": {
                        "newBalance": Math.floor(user.balance / 10),
                        "transactionId": (new mongoose.Types.ObjectId()).toString()
                    }
                })

                io.of('/general').to(user._id.toString()).emit('user', { user: user });

            }

            if(req.body.method == "rollbackTransaction"){
                res.status(200).json({
                    "jsonrpc": "2.0",
                    "id": 1928822492,
                    "result": {}
                })

            }
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.get('/', async(req, res) => {
        res.send("YOU SO DUMB")
    });
   
    
    return router;
    
}