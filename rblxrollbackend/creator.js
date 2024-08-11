const path = require('path');
const crypto = require('crypto');

const base64url = require('base64url');
const cbor = require('cbor');

const vanillacbor = require('./vanillacbor');

// Load application config
require('dotenv').config({ path: './config/config.env' });

// Load database
require('./database')();

const User = require('./database/models/User');
const BattlesGame = require('./database/models/BattlesGame');
const BattlesBet = require('./database/models/BattlesBet');
const UnboxGame = require('./database/models/UnboxGame');
const Setting = require('./database/models/Setting');

const battlesGetPrivate = async() => {
    try {
        const games = await BattlesGame.find({ 'options.private': true, state: 'created' }).lean();

        for(const game of games) {
            console.log(game);
        }
    } catch(err) {
        console.error(err);
    } 
}

const parseAuthData = (buffer) => {
    if(buffer.byteLength < 37)
        throw new Error('Authenticator Data must be at least 37 bytes long!');

    let rpIdHash      = buffer.slice(0, 32);             buffer = buffer.slice(32);

    /* Flags */
    let flagsBuffer   = buffer.slice(0, 1);              buffer = buffer.slice(1);
    let flagsInt      = flagsBuffer[0];
    let up            = !!(flagsInt & 0x01); // Test of User Presence
    let uv            = !!(flagsInt & 0x04); // User Verification
    let at            = !!(flagsInt & 0x40); // Attestation data
    let ed            = !!(flagsInt & 0x80); // Extension data
    let flags = {up, uv, at, ed, flagsInt};

    let counterBuffer = buffer.slice(0, 4);               buffer = buffer.slice(4);
    let counter       = counterBuffer.readUInt32BE(0);

    /* Attested credential data */
    let aaguid              = undefined;
    let aaguidBuffer        = undefined;
    let credIdBuffer        = undefined;
    let cosePublicKeyBuffer = undefined;
    let attestationMinLen   = 16 + 2 + 16 + 42; // aaguid + credIdLen + credId + pk


    if(at) { // Attested Data
        if(buffer.byteLength < attestationMinLen)
            throw new Error(`It seems as the Attestation Data flag is set, but the remaining data is smaller than ${attestationMinLen} bytes. You might have set AT flag for the assertion response.`)

        aaguid              = buffer.slice(0, 16).toString('hex'); buffer = buffer.slice(16);
        aaguidBuffer        = `${aaguid.slice(0, 8)}-${aaguid.slice(8, 12)}-${aaguid.slice(12, 16)}-${aaguid.slice(16, 20)}-${aaguid.slice(20)}`;

        let credIdLenBuffer = buffer.slice(0, 2);                  buffer = buffer.slice(2);
        let credIdLen       = credIdLenBuffer.readUInt16BE(0);
        credIdBuffer        = buffer.slice(0, credIdLen);          buffer = buffer.slice(credIdLen);

        let pubKeyLength    = vanillacbor.decodeOnlyFirst(buffer).byteLength;
        cosePublicKeyBuffer = buffer.slice(0, pubKeyLength);       buffer = buffer.slice(pubKeyLength);
    }

    let coseExtensionsDataBuffer = undefined;
    if(ed) { // Extension Data
        let extensionsDataLength = vanillacbor.decodeOnlyFirst(buffer).byteLength;

        coseExtensionsDataBuffer = buffer.slice(0, extensionsDataLength); buffer = buffer.slice(extensionsDataLength);
    }

    if(buffer.byteLength)
        throw new Error('Failed to decode authData! Leftover bytes been detected!');

    return {rpIdHash, counter, flags, counterBuffer, aaguid, credIdBuffer, cosePublicKeyBuffer, coseExtensionsDataBuffer}
}

const userRefactor = async() => {
    try {
        let attestationObject = 'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBZ8FojptMeh3JUOOJ3ioQTM3IyAZI-SAtHMpfQonV1DAyRQAAAAAAAAAAAAAAAAAAAAAAAAAAACBZOxMNBVUymc_tPUL4y-wEZJSJFT4QaLspCKEDHTZm-aQBAwM5AQAgWQEAtxnlJFz8Iop9THJoYrB9dLwv4DN2taWP6mC5qAxTfQne2obv31ENxsXXXXJZwplwHL2Ha1s2-Q760loWXcSYorvkxsle5NOQ3dMattcfrwCHkzzu2H6kLmSDacI6H6LamOQCPUE_S5FakWtiJLpdMqZ5R2sGmx4-lhKM2E1trIK1fQAdfv2yMm8MnYd9XAXdwFWX3u2xDnDTh-TDH8oviVDxOgtFqLlxyIch5yJ6ldocUjoSwmvI4Y3xIPDUc2VE2fP4AmhNMLAj7U30x_ITX8uwlmcVbf5attNr1o1KVO8aIgvknNgNMYSL3X2NGH6YbkJ_zwT12c0xYnT6euULLSFDAQAB';
        let attestationObjectBuffer = base64url.toBuffer(attestationObject);
        let ctapMakeCredResp = cbor.decodeAllSync(attestationObjectBuffer)[0];

        console.log(ctapMakeCredResp);
        const unpacked = parseAuthData(ctapMakeCredResp.authData);
        console.log(Buffer.from(unpacked.cosePublicKeyBuffer, 'base64').toString('base64'));
    } catch(err) {
        console.error(err);
    } 
} 

setTimeout(() => { userRefactor(); }, 0);
