const axios = require('axios');

async function fetchSessionCSRFToken(roblosecurityCookie, httpsAgent) {
    try {
        await axios.post("https://auth.roblox.com/v2/logout", {}, {
            httpsAgent: httpsAgent,
            proxy: false,
            headers: {
                'Cookie': `.ROBLOSECURITY=${roblosecurityCookie}`
            }
        });

        return null;
    } catch (error) {
        return error.response?.headers["x-csrf-token"] || null;
    }
}

async function generateAuthTicket(roblosecurityCookie, httpsAgent) {
    try {
        const csrfToken = await fetchSessionCSRFToken(roblosecurityCookie, httpsAgent);
        const response = await axios.post("https://auth.roblox.com/v1/authentication-ticket", {}, {
            httpsAgent: httpsAgent,
            proxy: false,
            headers: {
                "x-csrf-token": csrfToken,
                "referer": "https://www.roblox.com/madebySynaptrixBitch",
                'Content-Type': 'application/json',
                'Cookie': `.ROBLOSECURITY=${roblosecurityCookie}`
            }
        });

        return [response.headers['rbx-authentication-ticket'], csrfToken];
    } catch (error) {
        return "Failed to fetch auth ticket";
    }
}

async function redeemAuthTicket(authTicket, httpsAgent) {
    try {
        const response = await axios.post("https://auth.roblox.com/v1/authentication-ticket/redeem", {
            "authenticationTicket": authTicket
        }, {
            proxy: false,
            httpsAgent: httpsAgent,
            headers: {
                'RBXAuthenticationNegotiation': '1'
            }
        });

        const refreshedCookieData = response.headers['set-cookie']?.toString() || "";
        const refreshedCookie = refreshedCookieData.match(/(_\|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.\|_[A-Za-z0-9]+)/g)?.toString()

        return refreshedCookie
    } catch (error) {
        return "fail"
    }
}

async function logout(roblosecurityCookie, httpsAgent, csrfToken) {
    try {
        await axios.post("https://auth.roblox.com/v2/logout", {}, {
            httpsAgent: httpsAgent,
            proxy: false,
            headers: {
                "x-csrf-token": csrfToken,
                "referer": "https://www.roblox.com/madebySynaptrixBitch",
                'Content-Type': 'application/json',
                'Cookie': `.ROBLOSECURITY=${roblosecurityCookie}`
            }
        });

        return null;
    } catch (error) {
        return error.response?.headers["x-csrf-token"] || null;
    }
}

async function refresh_cookie(roblosecurityCookie, httpsAgent){
    try{
        const [authTicket, csrfToken] = await generateAuthTicket(roblosecurityCookie, httpsAgent);
        const redemptionResult = await redeemAuthTicket(authTicket, httpsAgent);

        logout(roblosecurityCookie, httpsAgent, csrfToken);

        return redemptionResult;
    }catch{
        return "fail";
    }



}

module.exports = {
    generateAuthTicket,
    redeemAuthTicket,
    refresh_cookie
};