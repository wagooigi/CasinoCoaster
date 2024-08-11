const validator = require('validator');
const crypto = require('crypto');
const fetch = require('node-fetch');
const HttpsProxyAgent = require("https-proxy-agent");

// Load database models
const Combat_legendGame = require('../database/models/Combat_legendGame');
const InGameModeLinks = require('../database/models/InGameModeLinks');
const settings = require('../database/config');

const combat_legendCheckGetGameDataData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.gameId === undefined || data.gameId === null || typeof data.gameId !== 'string' || validator.isMongoId(data.gameId) !== true) {
        throw new Error('Your entered game id is invalid.');
    }
}

const combat_legendCheckGetGameDataGame = (combat_legendGame) => {
    if(combat_legendGame === null) {
        throw new Error('Your entered game id is not available.');
    }
}

const combat_legendCheckSendCreateData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.amount === undefined || isNaN(data.amount) === true || Math.floor(data.amount) <= 0) {
        throw new Error('You’ve entered an invalid bet amount.');
    } else if(data.playerCount === undefined || isNaN(data.playerCount) === true || Math.floor(data.playerCount) <= 1 || Math.floor(data.playerCount) > 10) {
        throw new Error('Your entered player count is invalid.');
    } else if(Math.floor(data.amount) < Math.floor(process.env.DUELS_MIN_AMOUNT * 1000)) {
        throw new Error(`You can only bet a min amount of R$${parseFloat(process.env.DUELS_MIN_AMOUNT).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} per game.`);
    } else if(Math.floor(data.amount) > Math.floor(process.env.DUELS_MAX_AMOUNT * 1000)) {
        throw new Error(`You can only bet a max amount of R$${parseFloat(process.env.DUELS_MAX_AMOUNT).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} per game.`);
    }
}

const combat_legendCheckSendCreateUser = (data, user, userGames) => {
    if(user.balance < Math.floor(data.amount)) {
        throw new Error('You don’t have enough balance for this action.');
    } else if(userGames.length >= 1) {
        throw new Error('You already have 1 open game.');
    }
}

const combat_legendCheckSendBotData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.gameId === undefined || typeof data.gameId !== 'string' || validator.isMongoId(data.gameId) !== true) {
        throw new Error('Your entered game id is invalid.');
    }
}

const combat_legendCheckSendBotGame = (user, combat_legendGame, combat_legendBlockGame, combat_legendBlockJoin) => {
    if(combat_legendGame === undefined || combat_legendGame.state !== 'created' || combat_legendBlockGame.includes(combat_legendGame._id.toString()) === true || combat_legendGame.playerCount <= Math.floor(combat_legendGame.bets.length + combat_legendBlockJoin.filter((element) => element.toString() === combat_legendGame._id.toString()).length)) {
        throw new Error('Your requested game is not available or completed.');
    } else if(user._id.toString() !== combat_legendGame.bets[0].user._id.toString()) {
        throw new Error('You aren`t allowed to call bots for this game.');
    }
}

const combat_legendCheckSendJoinData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.gameId === undefined || typeof data.gameId !== 'string' || validator.isMongoId(data.gameId) !== true) {
        throw new Error('Your entered game id is invalid.');
    }
}

const combat_legendCheckSendJoinGame = (user, combat_legendGame, combat_legendBlockGame, combat_legendBlockJoin) => {
    if(combat_legendGame === undefined || combat_legendGame.state !== 'created' || combat_legendBlockGame.includes(combat_legendGame._id.toString()) === true || combat_legendGame.playerCount <= Math.floor(combat_legendGame.bets.length + combat_legendBlockJoin.filter((element) => element.toString() === combat_legendGame._id.toString()).length)) {
        throw new Error('Your requested game is not available or completed.');
    } else if(combat_legendGame.bets.some((element) => element.user._id.toString() === user._id.toString()) === true) {
       throw new Error('You are not allowed to join more then one time per combat_legend game.');
    }
}

const combat_legendCheckSendJoinUser = (user, combat_legendGame) => {
    if(user.balance < Math.floor(combat_legendGame.amount)) {
        throw new Error('You don’t have enough balance for this action.');
    }
}

const combat_legendCheckSendCancelData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.gameId === undefined || typeof data.gameId !== 'string' || validator.isMongoId(data.gameId) !== true) {
        throw new Error('Your entered game id is invalid.');
    }
}

const combat_legendCheckSendCancelGame = (user, combat_legendGame, combat_legendBlockGame, combat_legendBlockJoin) => {
    if(combat_legendGame === undefined || combat_legendGame.state !== 'created' || combat_legendBlockGame.includes(combat_legendGame._id.toString()) === true || combat_legendGame.playerCount <= Math.floor(combat_legendGame.bets.length + combat_legendBlockJoin.filter((element) => element.toString() === combat_legendGame._id.toString()).length)) {
        throw new Error('Your requested game is not available or completed.');
    } else if(user._id.toString() !== combat_legendGame.bets[0].user._id.toString()) {
        throw new Error('You aren`t allowed to cancel this game.');
    }
}

const combat_legendGenerateGame = (amount, playerCount, roblox_link) => {
    return new Promise(async(resolve, reject) => {
        try {
            // Generate new combat_legend server seed
            const seedServer = crypto.randomBytes(24).toString('hex');

            // Hash new generated combat_legend server seed
            const hash = crypto.createHash('sha256').update(seedServer).digest('hex');

            // Create new combat_legend game in database
            let gameDatabase = await Combat_legendGame.create({
                amount: amount,
                playerCount: playerCount,
                roblox_server_link: roblox_link,
                fair: {
                    seedServer: seedServer,
                    hash: hash
                },
                state: 'created'
            });

            // Convert game object to javascript object
            gameDatabase = gameDatabase.toObject();

            resolve(gameDatabase);
        } catch(err) {
            reject(err);
        }
    });
}

const combat_legendGetGameIndex = (combat_legendGames, gameId) => {
    return combat_legendGames.findIndex((element) => element._id.toString() === gameId.toString());
}

const combat_legendSanitizeGames = (games) => {
    let sanitized = [];

    for(let game of games) {
        game = JSON.parse(JSON.stringify(game));

        // Sanitize game fair property
        if(game.state !== 'completed') { game.fair = { hash: game.fair.hash }; }
        
        // Sanitize game bets user property
        for(let bet of game.bets) { 
            bet.user = bet.bot === true ? {} : {
                _id: bet.user._id, 
                roblox: bet.user.roblox, 
                username: bet.user.username, 
                avatar: bet.user.avatar, 
                rank: bet.user.rank,
                level: bet.user.level,
                rakeback: bet.user.rakeback.name,
                stats: bet.user.stats,
                createdAt: bet.user.createdAt
            };
        }

        // Add sanitized game to sanitized list
        sanitized.push(game);
    }

    return sanitized;
}

const combat_legendSanitizeGame = (game) => {
    let sanitized = JSON.parse(JSON.stringify(game));

    // Sanitize game fair property
    if(sanitized.state !== 'completed') { sanitized.fair = { hash: sanitized.fair.hash }; }

    // Sanitize game bets user property
    for(let bet of sanitized.bets) { 
        bet.user = bet.bot === true ? {} : {
            _id: bet.user._id, 
            roblox: bet.user.roblox,
            username: bet.user.username, 
            avatar: bet.user.avatar, 
            rank: bet.user.rank,
            level: bet.user.level,
            rakeback: bet.user.rakeback.name,
            stats: bet.user.stats,
            createdAt: bet.user.createdAt
        };
    }

    return sanitized;
}

const combat_legendCheckRoblox = (user) => {
    if(user.roblox === undefined) {
        throw new Error('You need to link your roblox account.');
    }
}

const combat_legendGenerateRobloxLink = async (token, proxy, robloxCookie, user) => {
    try{
        // Create new proxy agent
        const proxyAgent = new HttpsProxyAgent(proxy);

        // Create headers object
        let headers = {
            'content-type': 'application/json-patch+json',
            'x-csrf-token': token,
            'cookie': `.ROBLOSECURITY=${robloxCookie}`
        };

        // Create body object
        let body = {name: user.username, expectedPrice: 0};

        // buy vip server
        let response = await fetch(`https://games.roblox.com/v1/games/vip-servers/${settings.in_game.CombatLegend.uid}`, {
            method: 'POST',
            agent: proxyAgent,
            headers: headers,
            body: JSON.stringify(body)
        });

        let vipServerId = (await response.json()).vipServerId;

        response = await fetch(`https://games.roblox.com/v1/games/${settings.in_game.CombatLegend.placeId}/private-servers?cursor=&sortOrder=Desc&excludeFullGames=false`, {
            method: 'GET',
            agent: proxyAgent,
            headers: headers,
        });

        if(!vipServerId)
            vipServerId = ((await response.json()).data.find(_ => { return _.owner.id == parseInt(user.roblox.id)})).vipServerId


        if(!vipServerId)
            throw new Error("Your cookie expired. Please Login again!")

        body = {newJoinCode: true};
        
        // get vip server link
        response = await fetch(`https://games.roblox.com/v1/vip-servers/${vipServerId}`, {
            method: 'PATCH',
            agent: proxyAgent,
            headers: headers,
            body: JSON.stringify(body)
        });

        const res = await response.json()
        const vipServerLink  = res.link;

        let gameLinkDb = await InGameModeLinks.findOne({user: user._id});

        if(gameLinkDb){
            gameLinkDb.links.CombatLegend = vipServerLink;
            gameLinkDb.uid.CombatLegend = settings.in_game.CombatLegend.uid
        }else{
            gameLinkDb = new InGameModeLinks({
                user: user._id,
                links: { CombatLegend: vipServerLink },
                uid: { CombatLegend: settings.in_game.CombatLegend.uid }
            })
        }

        await gameLinkDb.save();

        return vipServerLink;

    }catch(err){
        throw new Error("Your cookie expired. Please Login again!")
    }
}

const combat_legendGetRobloxLink = async (user) => {
    try{
        const db = await InGameModeLinks.findOne({user: user._id}).lean();

        if(db.uid.CombatLegend != settings.in_game.CombatLegend.uid)
            return null;

        return db.links.CombatLegend;
    }catch(err){
        return null;
    }
}

module.exports = {
    combat_legendCheckGetGameDataData,
    combat_legendCheckGetGameDataGame,
    combat_legendCheckSendCreateData,
    combat_legendCheckSendCreateUser,
    combat_legendCheckSendBotData,
    combat_legendCheckSendBotGame,
    combat_legendCheckSendJoinData,
    combat_legendCheckSendJoinGame,
    combat_legendCheckSendJoinUser,
    combat_legendCheckSendCancelData,
    combat_legendCheckSendCancelGame,
    combat_legendGenerateGame,
    combat_legendGetGameIndex,
    combat_legendSanitizeGames,
    combat_legendSanitizeGame,
    combat_legendCheckRoblox,
    combat_legendGenerateRobloxLink,
    combat_legendGetRobloxLink
}
