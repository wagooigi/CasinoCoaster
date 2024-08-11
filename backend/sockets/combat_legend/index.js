const jwt = require('jsonwebtoken');

// Load database models
const User = require('../../database/models/User');

// Load middleware
const {
    rateLimiter
} = require('../../middleware/rateLimiter');

// Load utils
const {
    socketCheckUserData,
    socketCheckConnectionLimit,
    socketAddConnectionLimit,
    socketRemoveConnectionLimit,
    socketCheckAntiSpam,
    socketRemoveAntiSpam
} = require('../../utils/socket');
const {
    settingCheck
} = require('../../utils/setting');

// Load controllers
const {
    combat_legendGetData,
    combat_legendGetGameDataSocket,
    combat_legendSendCreateSocket,
    combat_legendSendBotSocket,
    combat_legendSendJoinSocket,
    combat_legendSendCancelSocket,
    combat_legendJoinRobloxSocket,
    combat_legendInit
} = require('../../controllers/combat_legend');

module.exports = (io) => {

    io.of('/combat_legend').use(async(socket, next) => {
        try {
            const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
            await socketCheckConnectionLimit('combat_legend', identifier);

            if(socket.handshake.auth !== undefined && socket.handshake.auth.token !== undefined) {
                try {
                    const decoded = await jwt.verify(socket.handshake.auth.token, process.env.TOKEN_SECRET);
                    socket.decoded = decoded;

                    if(socket.decoded !== undefined && socket.decoded !== null && socket.decoded._id !== undefined) { socket.join(socket.decoded._id.toString()); }
                } catch(err) {
                    return next(new Error('You need to sign in to perform this action.'));
                }
            }

            // Get combat_legend data from controller and send data to frontend
            const dataCombat_legend = combat_legendGetData();
            socket.emit('init', dataCombat_legend);

            next();
        } catch(err) {
            return next({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    io.of('/combat_legend').on('connection', (socket) => {
        const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
        socketAddConnectionLimit('combat_legend', identifier);

        socket.on('getGameData', async(data, callback) => {
            if(callback === undefined || typeof callback !== 'function') { return; }
            try {
                const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
                await rateLimiter.consume(identifier);
                try {
                    let user = null;
                    if(socket.decoded !== undefined && socket.decoded !== null) { user = await User.findById(socket.decoded._id).select('username avatar rank mute ban proxy'); }
                    socketCheckUserData(user, false);
                    settingCheck(user);
                    combat_legendGetGameDataSocket(io, socket, user, data, callback);
                } catch(err) {
                    callback({ success: false, error: { type: 'error', message: err.message } });
                }
            } catch(err) {
                callback({ success: false, error: { type: 'error', message: err.message !== undefined ? err.message : 'You need to slow down, you have send to many request. Try again in a minute.' } });
            }
        });

        socket.on('sendCreate', async(data, callback) => {
            if(callback === undefined || typeof callback !== 'function') { return; }
            if(socket.decoded !== undefined && socket.decoded !== null) {
                try {
                    const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
                    await rateLimiter.consume(identifier);
                    await socketCheckAntiSpam(socket.decoded._id);
                    try {
                        const user = await User.findById(socket.decoded._id).select('roblox username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt proxy').lean();
                        socketCheckUserData(user, true);
                        settingCheck(user, 'games.combat_legend.enabled');
                        combat_legendSendCreateSocket(io, socket, user, data, callback);
                    } catch(err) {
                        console.log(err);
                        socketRemoveAntiSpam(socket.decoded._id);
                        callback({ success: false, error: { type: 'error', message: err.message } });
                    }
                } catch(err) {
                    console.error(err);
                    callback({ success: false, error: { type: 'error', message: err.message !== undefined ? err.message : 'You need to slow down, you have send to many request. Try again in a minute.' } });
                }
            } else { callback({ success: false, error: { type: 'error', message: 'You need to sign in to perform this action.' } }); }
        });

        socket.on('sendJoinRoblox', async(data, callback) => {
            if(callback === undefined || typeof callback !== 'function') { return; }
            if(socket.decoded !== undefined && socket.decoded !== null) {
                try {
                    const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
                    await rateLimiter.consume(identifier);
                    await socketCheckAntiSpam(socket.decoded._id);
                    try {
                        const user = await User.findById(socket.decoded._id).select('roblox.id username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt').lean();
                        socketCheckUserData(user, true);
                        settingCheck(user, 'games.combat_legend.enabled');
                        combat_legendJoinRobloxSocket(io, socket, user, data, callback);
                    } catch(err) {
                        socketRemoveAntiSpam(socket.decoded._id);
                        callback({ success: false, error: { type: 'error', message: err.message } });
                    }
                } catch(err) {
                    console.error(err);
                    callback({ success: false, error: { type: 'error', message: err.message !== undefined ? err.message : 'You need to slow down, you have send to many request. Try again in a minute.' } });
                }
            } else { callback({ success: false, error: { type: 'error', message: 'You need to sign in to perform this action.' } }); }
        });

        socket.on('sendJoin', async(data, callback) => {
            if(callback === undefined || typeof callback !== 'function') { return; }
            if(socket.decoded !== undefined && socket.decoded !== null) {
                try {
                    const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
                    await rateLimiter.consume(identifier);
                    await socketCheckAntiSpam(socket.decoded._id);
                    try {
                        const user = await User.findById(socket.decoded._id).select('roblox.id username avatar rank balance xp stats limits affiliates anonymous mute ban createdAt').lean();
                        socketCheckUserData(user, true);
                        settingCheck(user, 'games.combat_legend.enabled');
                        combat_legendSendJoinSocket(io, socket, user, data, callback);
                    } catch(err) {
                        socketRemoveAntiSpam(socket.decoded._id);
                        callback({ success: false, error: { type: 'error', message: err.message } });
                    }
                } catch(err) {
                    console.error(err);
                    callback({ success: false, error: { type: 'error', message: err.message !== undefined ? err.message : 'You need to slow down, you have send to many request. Try again in a minute.' } });
                }
            } else { callback({ success: false, error: { type: 'error', message: 'You need to sign in to perform this action.' } }); }
        });

        socket.on('sendCancel', async(data, callback) => {
            if(callback === undefined || typeof callback !== 'function') { return; }
            if(socket.decoded !== undefined && socket.decoded !== null) {
                try {
                    const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
                    await rateLimiter.consume(identifier);
                    await socketCheckAntiSpam(socket.decoded._id);
                    try {
                        const user = await User.findById(socket.decoded._id).select('username avatar rank mute ban').lean();
                        socketCheckUserData(user, true);
                        settingCheck(user, 'games.combat_legend.enabled');
                        combat_legendSendCancelSocket(io, socket, user, data, callback);
                    } catch(err) {
                        socketRemoveAntiSpam(socket.decoded._id);
                        callback({ success: false, error: { type: 'error', message: err.message } });
                    }
                } catch(err) {
                    console.error(err);
                    callback({ success: false, error: { type: 'error', message: err.message !== undefined ? err.message : 'You need to slow down, you have send to many request. Try again in a minute.' } });
                }
            } else { callback({ success: false, error: { type: 'error', message: 'You need to sign in to perform this action.' } }); }
        });

        socket.on('disconnect', async() => {
            const identifier = socket.handshake.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
            socketRemoveConnectionLimit('combat_legend', identifier);
        });

    });

    // Init combat_legend game
    combat_legendInit(io);
}
