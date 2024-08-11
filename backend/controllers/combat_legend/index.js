const crypto = require('crypto');

// Load database models
const User = require('../../database/models/User');
const InGameModeLinks = require('../../database/models/InGameModeLinks');
const Combat_legendGame = require('../../database/models/Combat_legendGame');
const Combat_legendBet = require('../../database/models/Combat_legendBet');
const Rain = require('../../database/models/Rain');
const Leaderboard = require('../../database/models/Leaderboard');

// Load utils
const {
    socketRemoveAntiSpam
} = require('../../utils/socket');
const {
    settingGet
} = require('../../utils/setting');
const {
    fairGetData
} = require('../../utils/fair');
const {
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
} = require('../../utils/combat_legend');
const {
    generalUserGetLevel,
    generalUserGetRakeback,
    generalUserGetFormated
} = require('../../utils/general/user');

const { 
    authRobloxGetToken 
} = require('../../utils/auth/roblox');

// Load controllers
const {
    generalAddBetsList
} = require('../general/bets');

// Combat_legend variables
let combat_legendGames = [];
let combat_legendHistory = [];
let combat_legendBlockGame = [];
let combat_legendBlockJoin = [];
let combat_legendBlockCancel = [];

const combat_legendGetData = () => {
    return { games: combat_legendSanitizeGames(combat_legendGames), history: combat_legendHistory };
}

const combat_legendGetGameDataSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckGetGameDataData(data);

        // Get combat_legend game from combat_legend games array
        let combat_legendGame = combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)];

        // If combat_legend game was not in combat_legend games array try to get from database
        if(combat_legendGame === undefined) {
            combat_legendGame = await Combat_legendGame.findById(data.gameId).select('amount playerCount winner fair state createdAt').populate({ 
                path: 'winner', 
                populate: { path: 'user', select: 'roblox.id username avatar rank' } 
            }).populate({ 
                path: 'bets', 
                populate: { path: 'user', select: 'roblox.id username avatar rank' } 
            }).lean();
        }

        // Validate combat_legend game
        combat_legendCheckGetGameDataGame(combat_legendGame);

        callback({ success: true, game: combat_legendSanitizeGame(combat_legendGame) });
    } catch(err) {
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const combat_legendSendCreateSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckSendCreateData(data);

        // Validate user roblox
        combat_legendCheckRoblox(user);

        // Get users open combat_legend games from combat_legend game array
        const userGames = combat_legendGames.filter((game) => game.bets.find((bet) => bet.user._id.toString() === user._id.toString()));

        // Validate if user has enougth balance and not more then 1 open games
        combat_legendCheckSendCreateUser(data, user, userGames);

        let roblox_link = await combat_legendGetRobloxLink(user);

        if(!roblox_link){
            const token = await authRobloxGetToken(user.proxy, user.roblox.cookie);

            roblox_link = await combat_legendGenerateRobloxLink(token, user.proxy, user.roblox.cookie, user);
        }

        // Get user bet amount and player count
        const amount = Math.floor(data.amount);
        const playerCount = Math.floor(data.playerCount);

        // Get user level
        const level = generalUserGetLevel(user);

        // Get user rakeback rank
        const rakeback = generalUserGetRakeback(user);

        // Create combat_legend game in database
        let combat_legendGame = await combat_legendGenerateGame(amount, playerCount, roblox_link);

        // Create database query promises array
        let promises = [];

        // Add update users data, create duel bet and update referred user if available
        promises = [
            User.findByIdAndUpdate(user._id, {
                $inc: {
                    balance: -amount,
                    'stats.bet': amount
                },
                updatedAt: new Date().getTime()
            }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean(),
            Combat_legendBet.create({
                amount: amount,
                game: combat_legendGame._id,
                user: user._id,
                bot: false
            })
        ];

        // Execute promise queries in database
        let dataDatabase = await Promise.all(promises);

        // Convert bet to javascript object
        dataDatabase[1] = dataDatabase[1].toObject();

        // Add user data to bet object
        dataDatabase[1].user = { 
            _id: user._id, 
            roblox: user.roblox, 
            username: user.username, 
            avatar: user.avatar, 
            rank: user.rank,
            level: level,
            rakeback: rakeback,
            stats: user.anonymous === true ? null : user.stats,
            limits: user.limits,
            affiliates: user.affiliates,
            createdAt: user.createdAt
        };

        // Add bet to game object
        combat_legendGame.bets = [dataDatabase[1]];

        // Add combat_legend game to combat_legend game array
        combat_legendGames.push(combat_legendGame);

        // Send updated user to frontend
        io.of('/general').to(user._id.toString()).emit('user', { user: dataDatabase[0] });

        // Send combat_legend game to frontend
        io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

        callback({ success: true });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const combat_legendSendBotSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckSendBotData(data);

        // Validate combat_legend game
        combat_legendCheckSendBotGame(user, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)], combat_legendBlockGame, combat_legendBlockJoin);

        try {
            // Add game id to game block array
            combat_legendBlockGame.push(data.gameId.toString());

            // Get game bet amount
            const amountGameBet = combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].amount;

            // Create database query promises array
            let promises = [];

            // Add create combat_legend bet queries to promises array
            for(let i = 0; i < (combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].playerCount - combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets.length); i++) {
                promises.push(
                    Combat_legendBet.create({
                        amount: amountGameBet,
                        game: combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id,
                        bot: true
                    })
                );
            }

            // Execute promise queries in database
            let betsDatabase = await Promise.all(promises);

            // Convert bet objects to javascript objects
            betsDatabase = betsDatabase.map((bet) => bet.toObject());

            // Add bets to game object
            combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets = [...combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets, ...betsDatabase];

            // Send combat_legend game to frontend
            io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]) });

            // If combat_legend game is full and the state is created start rolling game
            if(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].playerCount <= combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets.length && combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].state === 'created') {
                combat_legendGameCountdown(io, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]);
            }

            callback({ success: true });

            // Remove game id from game block array
            combat_legendBlockGame.splice(combat_legendBlockGame.indexOf(data.gameId.toString()), 1);

            socketRemoveAntiSpam(user._id);
        } catch(err) {
            socketRemoveAntiSpam(socket.decoded._id);
            combat_legendBlockGame.splice(combat_legendBlockGame.indexOf(data.gameId.toString()), 1);
            callback({ success: false, error: { type: 'error', message: err.message } });
        }
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const combat_legendSendJoinSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckSendJoinData(data);

        // Get users open combat_legend games from combat_legend game array
        const userGames = combat_legendGames.filter((game) => game.bets.find((bet) => bet.user._id.toString() === user._id.toString()));

        if(userGames.length >= 1) {
            throw new Error('You already have 1 open game.');
        }
        
        // Validate user roblox
        combat_legendCheckRoblox(user);

        // Validate combat_legend game
        combat_legendCheckSendJoinGame(user, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)], combat_legendBlockGame, combat_legendBlockJoin);

        try {
            // Add game id to join block array
            combat_legendBlockJoin.push(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id.toString());

            // Validate if user has enougth balance
            combat_legendCheckSendJoinUser(user, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]);

            // Get game bet amount
            const amountGameBet = combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].amount;

            // Get user level
            const level = generalUserGetLevel(user);

            // Get user rakeback rank
            const rakeback = generalUserGetRakeback(user);

            // Create database query promises array
            let promises = [];

            // Add update users data, rain, referred user and create combat_legend bet queries
            promises = [
                User.findByIdAndUpdate(user._id, {
                    $inc: {
                        balance: -amountGameBet,
                        'stats.bet': amountGameBet
                    },
                    updatedAt: new Date().getTime()
                }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean(),
                Combat_legendBet.create({
                    amount: amountGameBet,
                    game: combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id,
                    user: user._id,
                    bot: false
                })
            ];

            // Execute promise queries in database
            let dataDatabase = await Promise.all(promises);

            // Convert bet to javascript object
            dataDatabase[1] = dataDatabase[1].toObject();

            // Add user data to bet object
            dataDatabase[1].user = { 
                _id: user._id, 
                roblox: user.roblox, 
                username: user.username, 
                avatar: user.avatar, 
                rank: user.rank,
                level: level,
                rakeback: rakeback,
                stats: user.anonymous === true ? null : user.stats,
                limits: user.limits,
                affiliates: user.affiliates,
                createdAt: user.createdAt
            };

            // Add bet to game object
            combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets.push(dataDatabase[1]);

            // Send updated user to frontend
            io.of('/general').to(user._id.toString()).emit('user', { user: dataDatabase[0] });

            // Send combat_legend game to frontend
            io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]) });

            // If combat_legend game is full and the state is created start rolling game
            if(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].playerCount <= combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].bets.length && combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)].state === 'created') {
                combat_legendGameCountdown(io, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]);
            }

            callback({ success: true });

            // Remove game id from join block array
            combat_legendBlockJoin.splice(combat_legendBlockJoin.indexOf(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id.toString()), 1);

            socketRemoveAntiSpam(user._id);
        } catch(err) {
            socketRemoveAntiSpam(socket.decoded._id);
            combat_legendBlockJoin.splice(combat_legendBlockJoin.indexOf(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id.toString()), 1);
            callback({ success: false, error: { type: 'error', message: err.message } });
        }
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const combat_legendJoinRobloxSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckSendJoinData(data);

        try {
            const game = combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)];

            if(!game)
                throw new Error("No game found!");
            
            const bet = await Combat_legendBet.findOne({game: game._id, user: user._id});

            if(!bet)
                throw new Error("You didn't join this match.");

            callback({ success: true, data: { roblox_server_link: game.roblox_server_link} });

            socketRemoveAntiSpam(user._id);
        } catch(err) {
            socketRemoveAntiSpam(socket.decoded._id);
            combat_legendBlockJoin.splice(combat_legendBlockJoin.indexOf(combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)]._id.toString()), 1);
            callback({ success: false, error: { type: 'error', message: err.message } });
        }
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}


const combat_legendSendCancelSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        combat_legendCheckSendCancelData(data);

        // Validate combat_legend game
        combat_legendCheckSendCancelGame(user, combat_legendGames[combat_legendGetGameIndex(combat_legendGames, data.gameId)], combat_legendBlockGame, combat_legendBlockJoin);

        try {
            // Add game id to game block array
            combat_legendBlockGame.push(data.gameId.toString());

            callback({ success: true });

            // Remove game id from join block array
            combat_legendBlockGame.splice(combat_legendBlockGame.indexOf(data.gameId.toString()), 1);

            socketRemoveAntiSpam(user._id);
        } catch(err) {
            socketRemoveAntiSpam(socket.decoded._id);
            combat_legendBlockGame.splice(combat_legendBlockGame.indexOf(data.gameId.toString()), 1);
            callback({ success: false, error: { type: 'error', message: err.message } });
        }
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const combat_legendGameCountdown = (io, combat_legendGame) => {
    // Update combat_legend game state to countdown and updated at
    combat_legendGame.state = 'countdown';
    combat_legendGame.updatedAt = new Date().getTime();

    // Update game object in combat_legend games array
    combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1, combat_legendGame);

    // Send combat_legend game to frontend
    io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

    setTimeout(() => { combat_legendGameValidate(io, combat_legendGame); }, 120000)
}

const combat_legendGameValidate = async(io, combat_legendGame) => {
    try {
        // Update combat_legend game state to pending
        combat_legendGame.state = 'pending';

        if(!combat_legendGame.server_created){
            combat_legendGame.state = 'completed';
            combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1);
           
            io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

            for(const bet of combat_legendGame.bets){
                const db = await User.findByIdAndUpdate(bet.user._id, { $inc : { balance: combat_legendGame.amount}}, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean()

                io.of('/general').to(bet.user._id.toString()).emit('user', { user: db });
            }

            return;
        }

        // Update game object in combat_legend games array
        combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1, combat_legendGame);

        // Send combat_legend game to frontend
        io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

        // Get public seed data from eos provider
        const dataFair = await fairGetData();

        // Add public seed data to combat_legend game object
        combat_legendGame.fair.seedPublic = dataFair.data.head_block_id;
        combat_legendGame.fair.blockId = dataFair.data.head_block_num;

        // Update game object in combat_legend games array
        combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1, combat_legendGame);

        // setTimeout(() => { combat_legendGameRoll(io, combat_legendGame); }, 1000);
    } catch(err) {
        console.error(err);
        setTimeout(() => { combat_legendGameValidate(io, combat_legendGame); }, 1000 * 15);
    }
}

const combat_legendGameRoll = async(io, combat_legendGame, winnerRobloxId) => {
    try {
        for(const [index, bet] of combat_legendGame.bets.entries()) {
            // Add roll outcome to bet
            combat_legendGame.bets[index].roll = 0;

            if(combat_legendGame.bets[index].user.roblox.id == winnerRobloxId)
                combat_legendGame.bets[index].roll = 100;
        }

        // Get winner bet from combat_legend game object
        let winnerBet = combat_legendGame.bets.reduce((winner, bet) => winner.roll > bet.roll ? winner : bet);

        // Update winner payout amount
        winnerBet.payout = Math.floor(combat_legendGame.amount * combat_legendGame.playerCount * 0.8);

        // Update combat_legend game winner, state, winner bet payout amount and updated at
        combat_legendGame.state = 'rolling';
        combat_legendGame.winner = winnerBet;
        combat_legendGame.bets[combat_legendGame.bets.findIndex((element) => element._id.toString() === winnerBet._id.toString())] = winnerBet;
        combat_legendGame.updatedAt = new Date().getTime();

        // Update game object in combat_legend games array
        combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1, combat_legendGame);

        // Send combat_legend game to frontend
        io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

        setTimeout(() => { combat_legendGameComplete(io, combat_legendGame); }, 1000);
    } catch(err) {
        console.error(err);
    }
}

const combat_legendGameComplete = async(io, combat_legendGame) => {
    try {
        // Update combat_legend game state
        combat_legendGame.state = 'completed';

        // Get running leaderboard from database if available
        const leaderboardDatabase = await Leaderboard.findOne({ state: 'running' }).select('state').lean();

        // Create promises arrays
        let promisesUsers = [];
        let promisesBets = [];
        let promisesAffiliates = [];

        // Create reports stats and rain variable
        let amountBetTotal = 0;
        let amountBetRain = 0;

        const settings = settingGet();

        // Add update combat_legend bet querys to promise array
        for(const bet of combat_legendGame.bets) {
            // Get payout amount for user bet
            const amountPayout = combat_legendGame.winner._id.toString() === bet._id.toString() ? combat_legendGame.winner.payout : 0;
            

            // Add user update query to users promises array
            promisesUsers.push(
                User.findByIdAndUpdate(bet.user._id, {
                    $inc: {
                        balance: amountPayout,
                        xp: bet.user.limits.blockSponsor !== true ? Math.floor(bet.amount * settings.general.reward.multiplier) : 0,
                        'stats.won': amountPayout,
                        'limits.betToWithdraw': bet.user.limits.betToWithdraw <= bet.amount ? -bet.user.limits.betToWithdraw : -bet.amount,
                        'limits.betToRain': bet.user.limits.betToRain <= bet.amount ? -bet.user.limits.betToRain : -bet.amount,
                        'leaderboard.points': leaderboardDatabase !== null && bet.user.limits.blockSponsor !== true && bet.user.limits.blockLeaderboard !== true ? bet.amount : 0,
                    },
                    updatedAt: new Date().getTime()
                }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean()
            );

            
            // Add user update query to bets promises array
            promisesBets.push(
                Combat_legendBet.findByIdAndUpdate(bet._id, {
                    payout: amountPayout,
                    multiplier: Math.floor((amountPayout / combat_legendGame.amount) * 100),
                    roll: bet.roll,
                    updatedAt: new Date().getTime()
                }, { new: true }).select('amount payout multiplier user bot updatedAt').populate({ 
                    path: 'user', 
                    select: 'roblox.id username avatar rank xp stats rakeback anonymous createdAt' 
                }).lean()
            );
        }

        // Update combat_legend game, rain, users, bets and affiliates
        let dataDatabase = await Promise.all([
            Combat_legendGame.findByIdAndUpdate(combat_legendGame._id, {
                winner: combat_legendGame.winner._id,
                fair: combat_legendGame.fair,
                state: 'completed',
                updatedAt: new Date().getTime()
            }, {}),
            Rain.findOneAndUpdate({ type: 'site', $or: [{ state: 'created' }, { state: 'pending' }, { state: 'running' }] }, {
                $inc: {
                    amount: Math.floor(amountBetRain * 0.001)
                }
            }, { new: true }).select('amount participants type state updatedAt').lean(),
            ...promisesUsers,
            ...promisesBets,
            ...promisesAffiliates
        ]);

        // Add combat_legend game to combat_legend history and remove last element from combat_legend history if its longer then 25
        combat_legendHistory.unshift(combat_legendSanitizeGame(combat_legendGame));
        if(combat_legendHistory.length > 25) { combat_legendHistory.pop(); }

        // Remove combat_legend game from combat_legend games array
        combat_legendGames.splice(combat_legendGetGameIndex(combat_legendGames, combat_legendGame._id), 1);

        // Send combat_legend game to frontend
        io.of('/combat_legend').emit('game', { game: combat_legendSanitizeGame(combat_legendGame) });

        // Send updated site rain to frontend
        io.of('/general').emit('rain', { rain: dataDatabase[1] });

        // Send updated users to frontend
        for(const user of dataDatabase.slice(2, promisesUsers.length + 2)) { io.of('/general').to(user._id.toString()).emit('user', { user: user }); }

        // Send updated bets to frontend
        for(const bet of dataDatabase.slice(promisesUsers.length + 2, promisesUsers.length + promisesBets.length + 2)) { 
            if(bet.bot !== true) { generalAddBetsList(io, { ...bet, user: generalUserGetFormated(bet.user), method: 'combat_legend' }); } 
        }
    } catch(err) {
        console.error(err);
    }
}

const combat_legendInit = async(io) => {
    try {
        // Get all uncompleted combat_legend games and last 25 completed combat_legend games from database
        const dataDatabase = await Promise.all([
            Combat_legendGame.find({ $or: [{ state: 'created' }, { state: 'pending' }, { state: 'rolling' } ]}).select('amount playerCount fair state updatedAt createdAt').populate({ 
                path: 'bets', 
                populate: { path: 'user', select: 'roblox.id username avatar rank xp limits stats.total affiliates anonymous createdAt' } 
            }).lean(),
            Combat_legendGame.find({ state: 'completed' }).sort({ createdAt: -1 }).limit(25).select('amount playerCount winner fair state createdAt').populate({ 
                path: 'winner', 
                populate: { path: 'user', select: 'roblox.id username avatar rank createdAt' } 
            }).populate({ 
                path: 'bets', 
                populate: { path: 'user', select: 'roblox.id username avatar rank createdAt' } 
            }).lean()
        ]);

        // Add history games to combat_legend history variable
        combat_legendHistory = dataDatabase[1];

        // Create promises array
        let promises = [];

        // Handle all uncompleted crash games
        for(const game of dataDatabase[0]) {
            if(game.playerCount === game.bets.length) {
                // Add update combat_legend game query to promises array
                promises.push(
                    Combat_legendGame.findByIdAndUpdate(game._id, {
                        state: 'canceled',
                        updatedAt: new Date().getTime()
                    }, {})
                );

                // Add update user queries to promises array
                for(const bet of game.bets) {
                    promises.push(
                        User.findByIdAndUpdate(bet.user, {
                            $inc: {
                                balance: game.amount,
                                'stats.total.bet': -game.amount,
                                'stats.combat_legend.bet': -game.amount
                            },
                            updatedAt: new Date().getTime()
                        }, {})
                    );
                }
            } else {
                for(let bet of game.bets) {
                    // Get user level
                    const level = generalUserGetLevel(bet.user);

                    // Get user rakeback rank
                    const rakeback = generalUserGetRakeback(bet.user);

                    // Update bet user
                    bet.user = { 
                        _id: bet.user._id, 
                        roblox: bet.user.roblox, 
                        username: bet.user.username, 
                        avatar: bet.user.avatar, 
                        rank: bet.user.rank,
                        level: level,
                        rakeback: rakeback,
                        stats: bet.user.anonymous === true ? null : bet.user.stats,
                        limits: bet.user.limits,
                        affiliates: bet.user.affiliates,
                        createdAt: bet.user.createdAt
                    };
                }

                // Add uncompleted game to combat_legend games array
                combat_legendGames.push(game); 
            }
        }

        // Execute database queries
        await Promise.all(promises);
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    combat_legendGetData,
    combat_legendGetGameDataSocket,
    combat_legendSendCreateSocket,
    combat_legendSendBotSocket,
    combat_legendSendJoinSocket,
    combat_legendSendCancelSocket,
    combat_legendJoinRobloxSocket,
    combat_legendInit,
    combat_legendGameRoll,
    combat_legendGames
}
