import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { readFileSync, writeFile } from 'fs'; 

dotenv.config();

const auth = {
    "Accept": "application/vnd.twitchtv.v5+json",
    "Authorization": `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
    "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
}
const authCType = (token, id) => {
    return {
        "Accept": "application/vnd.twitchtv.v5+json",
        "Authorization": `Bearer ${token}`,
        "Client-Id": `${id}`,
        'Content-Type': 'application/json'
    }
}

export async function getChannelIDFromName(name) {
    try {
        let id = await fetch(`https://api.twitch.tv/helix/users?login=${name}`, {
            headers: auth,
            method: 'GET'
        })
        .then((response) => response.json())
        .then((json) => json['data'])
        .then((data) => data[0]['id']);
        console.warn("ACTION: channel id received");
        return id;
    } catch (err) {
        console.log(err);
        return "";4
    }

}

async function getGameIDFromName(name) {
    let game = await fetch(`https://api.twitch.tv/helix/games?name=${name}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['id']);

    console.warn("ACTION: game id received");
    return game;
}

export async function setCurrentGame(client, channel, channelID, gameName) {
    let gameID = await getGameIDFromName(gameName);
    let oldGame = await getUserCurrentGame(client, channel, channelID);
    let token = await getChannelManageBroadcastScope();
    try{
        let res = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
            headers: authCType(token, process.env.TWITCH_BROADCASTER_ID),
            body: JSON.stringify({ game_id: gameID }),
            method: 'PATCH'
        });
        console.warn(`ACTION: current game changed to ${gameName} (${gameID})`);
        let newGame = await getUserCurrentGame(client, channel, channelID);
        if(oldGame.toLowerCase() == newGame.toLowerCase()){
            client.say(channel, `The current game has not been changed`);
        } else{
            client.say(channel, `The current game has changed to ${gameName} successfully.`);
        }
    } catch(err) {
        console.error(`ACTION ERROR: current game could not be changed`);
    }
}

export async function getUserCurrentGame(client, channel, channelID) {
    try{
        let game = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
            headers: auth,
            method: 'GET'
        })
        .then((response) => response.json())
        .then((json) => json['data'])
        .then((data) => data[0]['game_name']);
        console.warn("ACTION: current game received");
        return game;
    } catch (err) {
        console.log("Game could not be found.")
        return "<no game>";
    }
}

export async function getCurrentGame(client, channel, channelID) {
    let game = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${channelID}`, {
        headers: auth,
        method: 'GET'
    })
    .then((response) => response.json())
    .then((json) => json['data'])
    .then((data) => data[0]['game_name']);
    console.warn("ACTION: current game received");
    client.say(channel, `The current game is ${game}`);
}

export async function sendAnnouncement(channelID, msg){
    let token = await getModeratorManageAnnouncementsScope();
    let announcement = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${channelID}&moderator_id=${process.env.TWITCH_APP_CLIENT}`, {
        headers: authCType(token, process.env.TWITCH_APP_CLIENT),
        body: JSON.stringify({
            message: msg,
            color: `green`
        }),
        method: 'POST'
    })
    .then((response) => response.json())
    console.log(announcement);
}

/*function generateState(){
    return randomBytes(16).toString("hex");
}*/

async function getModeratorManageAnnouncementsScope() {
    // check for refresh token
    let refreshToken = "";
    try {
        refreshToken = readFileSync('./statics/tokens/moderatormanageannouncementsrefresh.txt', 'utf8');
    } catch (err) {
        console.log(err);
    }

    let response;
    // if no refresh, get new token
    if(refreshToken == undefined || refreshToken == ""){
        response = await fetch(`https://id.twitch.tv/oauth2/token`+
                                    `?client_id=${process.env.TWITCH_APP_CLIENT}`+
                                    `&client_secret=${process.env.TWITCH_APP_SECRET}`+
                                    `&code=${process.env.MODERATOR_MANAGE_ANNOUNCEMENTS_SCOPE_CODE}`+
                                    `&grant_type=authorization_code`+
                                    `&redirect_uri=http://localhost`, {
            method: 'POST'
        })
        .then((response) => response.json());
    } else{
        //let refresh_encoded = encodeURI(refreshToken);
        // if token, refresh
        response = await fetch(`https://id.twitch.tv/oauth2/token`+
                                `?client_id=${process.env.TWITCH_APP_CLIENT}`+
                                `&client_secret=${process.env.TWITCH_APP_SECRET}`+
                                `&grant_type=refresh_token`+
                                `&refresh_token=${refreshToken}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        })
        .then((response) => response.json());
    }

    // Write to file new refresh token
    let result = "";
    if(response['refresh_token'] != undefined){
        result = response['refresh_token'];
    }
    writeFile('./statics/tokens/moderatormanageannouncementsrefresh.txt', result, err => {
        if (err) {
          console.error(err);
        }
    });

    // get token and return
    let token = response['access_token'];
    console.warn("ACTION: moderator:manage:announcements token generated");
    return token;
}

async function getChannelManageBroadcastScope() {
    // check for refresh token
    let refreshToken = "";
    try {
        refreshToken = readFileSync('./statics/tokens/channelmanagebroadcastrefresh.txt', 'utf8');
    } catch (err) {
        console.log(err);
    }

    let response;
    // if no refresh, get new token
    if(refreshToken == undefined){
        response = await fetch(`https://id.twitch.tv/oauth2/token`+
                                    `?client_id=${process.env.TWITCH_APP_CLIENT}`+
                                    `&client_secret=${process.env.TWITCH_APP_SECRET}`+
                                    `&code=${process.env.CHANNEL_MANAGE_BROADCAST_SCOPE_CODE}`+
                                    `&grant_type=authorization_code`+
                                    `&redirect_uri=http://localhost`, {
            method: 'POST'
        })
        .then((response) => response.json());
    } else{
        //let refresh_encoded = encodeURI(refreshToken);
        // if token, refresh
        response = await fetch(`https://id.twitch.tv/oauth2/token`+
                                `?client_id=${process.env.TWITCH_APP_CLIENT}`+
                                `&client_secret=${process.env.TWITCH_APP_SECRET}`+
                                `&grant_type=refresh_token`+
                                `&refresh_token=${refreshToken}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        })
        .then((response) => response.json());
    }

    // Write to file new refresh token
    let result = "";
    if(response['refresh_token'] != undefined){
        result = response['refresh_token'];
    }
    writeFile('./statics/tokens/channelmanagebroadcastrefresh.txt', result, err => {
        if (err) {
          console.error(err);
        }
    });

    // get token and return
    let token = response['access_token'];
    console.warn("ACTION: channel:manage:broadcast token generated");
    return token;
}