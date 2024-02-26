import dotenv from 'dotenv';

dotenv.config();

const auth = {
    "Accept": "application/vnd.twitchtv.v5+json",
    "Authorization": `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
    "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
}
const authCType = {
    "Accept": "application/vnd.twitchtv.v5+json",
    "Authorization": `Bearer ${process.env.TWITCH_BROADCASTER_OAUTH_TOKEN}`,
    "Client-Id": `${process.env.TWITCH_BROADCASTER_ID}`,
    'Content-Type': 'application/json'
}

export async function getChannelIDFromName(name) {
    let id = await fetch(`https://api.twitch.tv/helix/users?login=${name}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['id']);

    console.warn("ACTION: channel id received")
    return id;
}

async function getGameIDFromName(name) {
    let game = await fetch(`https://api.twitch.tv/helix/games?name=${name}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['id']);

    console.warn("ACTION: game id received")
    return game;
}

export async function setCurrentGame(client, channel, channelID, gameName) {
    let gameID = await getGameIDFromName(gameName);
    try{
        let res = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
            headers: authCType,
            body: JSON.stringify({ game_id: gameID }),
            method: 'PATCH'
        })
        .then((response) => response.json())
        .then((json) => console.log(json));
        console.warn(`ACTION: current game changed to ${gameName} (${gameID})`);
        client.say(channel, `The current game has changed to ${gameName} successfully.`);
    } catch(err) {
        console.error(`ACTION ERROR: current game could not be changed`);
    }
}

export async function getUserCurrentGame(client, channel, channelID) {
    let game = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['game_name']);
    console.warn("ACTION: current game received")
    return game;
}

export async function getCurrentGame(client, channel, channelID) {
    let game = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['game_name']);
    console.warn("ACTION: current game received")
    client.say(channel, `The current game is ${game}`);
}