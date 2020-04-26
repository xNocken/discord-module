const request = require('request');
const WebSocket = require('ws');
let key = '';

function init(authKey = '') {
    key = authKey;
};

function raw(content = '', url = '', method = 'post', callback = () => {}) {
    sendRequest(content, url, method, callback)
}

function message(server = '', content = '', callback = () => {}) {
    if (!server) {
        console.error('Server is needed');
        return;
    }

    const body = {
        content: content,
        nonce: String(Math.random()),
        tts: 'false',
    }
    const url = `https://discordapp.com/api/v6/channels/${(server)}/messages`;

    sendRequest(JSON.stringify(body), url, 'POST', callback)
}

function embed(server = '', embed = {}, callback = () => {}) {
    if (!server) {
        console.error('Server is needed');
        return;
    }

    const body = {
        nonce: String(Math.random()),
        tts: 'false',
        embed,
    }
    const url = `https://discordapp.com/api/v6/channels/${(server)}/messages`;

    sendRequest(JSON.stringify(body), url, 'POST', callback)
}
function deleteMessage(channelId = '', messageId = '', callback = () => {} ) {
    const url = `https://discordapp.com/api/v6/channels/${channelId}/messages/${messageId}`;

    sendRequest('', url, 'DELETE', callback);
}

function getMessages(server = '', count = 0, callback = () => {}) {
    const url = `https://discordapp.com/api/v6/channels/${server}/messages?limit=${count}`;

    sendRequest('', url, 'GET', callback);
}

function typing(server = '') {
    const url = `https://discordapp.com/api/v6/channels/${server}/typing`;
    sendRequest('', url, 'POST')
}

function invites(server = '', max_age = 0, max_uses = 0, temporary = false, callback = () => {}) {
    const body = {
        max_age,
        max_uses,
        temporary,
    }
    const url = `https://discordapp.com/api/v6/channels/${server}/invites`;

    sendRequest(JSON.stringify(body), url, 'POST', callback);
    return (handleReturn());
}

function science(token = '', events = {}) {
    const body = {
        events,
        token,
    }

    sendRequest(JSON.stringify(body), 'https://discordapp.com/api/v6/science', 'POST');
}

function changeRole(server = '', user = '', roles = [], callback = () => {}) {
    const url = `https://discordapp.com/api/v6/guilds/${server}/members/${user}`;
    sendRequest(JSON.stringify({ roles }), url, 'PATCH', callback)
}

function checkInvite(code = '', callback = () => {}) {
    const url = `https://discordapp.com/api/v6/invites/${code}`;
    sendRequest('', url, 'POST', callback)
}

function getUserInfo(userId = '', callback = () => {}) {
    const url = `https://discordapp.com/api/v6/users/${userId}`;

    sendRequest('', url, 'GET', callback)
}

function redeemCode(code = '', callback = () => {}) {
    const url = `https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`;

    sendRequest('{"channel_id":null,"payment_source_id":null}', url, 'POST', callback)
}

function sendRequest(body = '', url = '', method = '', callback = () => {}) {
    var settings = {
        url,
        method,
        "headers": {
            "authorization": key,
            "Content-Type": "application/json",
        },
        body,
    }

    request(settings, function (err, res, body) {
        callback(body);
    });
}


function connectGateway(onopen = () => { }, plattform = 'Windows') {
    const websocket = new WebSocket('wss://gateway.discord.gg/');
    websocket.onopen = () => {
        websocket.send(`{"op":2,"d":{"token":"${key}","properties":{"os":"${plattform}","browser":"Chrome","device":"","browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36","browser_version":"81.0.4044.122","os_version":"10","referrer":"https://discord.app/","referring_domain":"discord.app","referrer_current":"https://discord.app/","referring_domain_current":"discord.app","release_channel":"stable","client_build_number":58583,"client_event_source":null},"presence":{"status":"online","since":0,"activities":[],"afk":true},"compress":false}}`);

        setInterval(() => {
            websocket.send('{"op":1,"d":638}');
        }, 30000);
        onopen();
    };

    return websocket;
}

module.exports = {
    message,
    typing,
    init,
    invites,
    raw,
    science,
    changeRole,
    checkInvite,
    getMessages,
    connectGateway,
    embed,
    deleteMessage,
    getUserInfo,
    redeemCode,
};