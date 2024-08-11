const axios = require("axios");
const https = require("https");
const fs = require("fs");

const {
    socketRemoveAntiSpam
} = require('../../../utils/socket');

const User = require('../../../database/models/User');


//
let slots_game_data = [];

const httpsAgent = new https.Agent({
    key: fs.readFileSync(__dirname + '/mascotssl/client.key'),
    cert: fs.readFileSync(__dirname + '/mascotssl/client.crt'),
    rejectUnauthorized: false,
    keepAlive: true,
    family: 4
});

const MascotApi = axios.create({ 
    httpsAgent, 
    headers: {
        post: {
            Accept: 'application/json',   
            'Content-Type': 'application/json'
        }
    }
})

MascotApi.post("https://api.mascot.games/v1/", {
    "jsonrpc": "2.0",
    "method": "Game.List",
    "id": 1920911592,
    "params": {
        "BankGroupId": "robux_bank_group"
    }
}).then((res) =>  {
    slots_game_data = res.data.result.Games;
}).catch((err) => {
    console.log(err);
})

const slotsGetData = (io, socket, user, data, callback) => {
    return new Promise(async(resolve, reject) => {
        try {
            resolve({ boxes: slots_game_data });
        } catch(err) {
            reject(err);
        }
    });
}

const slotsCreateGame = async (io, socket, user, data, callback) => {
    try{
        if(!user){
            throw new Error("You need to login to play.")
        }

        if(!user.slots || !user.slots.mascot){
            // set player
            let req = {
                "jsonrpc": "2.0",
                "method": "Player.Set",
                "id": 1928822491,
                "params": {
                    "Id": user._id.toString(),
                    "Nick": user.username,
                    "BankGroupId": "robux_bank_group"
                }
            };

            let res = await MascotApi.post("https://api.mascot.games/v1/", JSON.stringify(req));

            await User.findByIdAndUpdate(user._id, {
                "$set" : {
                    "slots.mascot" : true
                }
            })

            await new Promise(r => setTimeout(r, 2000));
        }

        


        // create game
        let req = {
            "jsonrpc": "2.0",
            "method": "Session.Create",
            "id": 1047919053,
            "params": {
                "PlayerId": user._id.toString(),
                "GameId": data.boxId,
                "Params": {
                    "language": "en"
                }
            }
        };

        let res = await MascotApi.post("https://api.mascot.games/v1/", JSON.stringify(req));

        if(!res.data.result){
            socketRemoveAntiSpam(user._id);
            throw new Error(res.data.error.message)
        }

        callback({ success: true, box: {url: res.data.result.SessionUrl, Id: data.boxId, Name: slots_game_data.find(_ => _.Id === data.boxId).Name}});

        socketRemoveAntiSpam(user._id);

    }catch(err){

        callback({ success: false, error: { type: 'error', message: err.message } });
    }

}


module.exports = {
    slotsGetData,
    slotsCreateGame,
}