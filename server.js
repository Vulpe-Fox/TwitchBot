import dotenv from 'dotenv';
import { Client } from 'tmi.js';

// think !hug @vulpefox
const regexCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
// think !meow
//const regexStaticCommand = new RegExp(/(?:\W+)?!([a-zA-Z0-9]+)(?:\W+)?/);

// command responses
const commands = {
    whoami: (username) => `You are ${username}`
}

dotenv.config();
const client = new Client({
    connection: { 
        reconnect: true 
    },
    channels: [ 'Vulpefox' ],
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    }
});

client.connect();

// tags:
//  client-nonce -> silly nonce, useless in theory
//  badge-info -> Subset badges -> can be null
//      -> list consists of badges on user
//  display-name -> name
//  color -> name colour
//  emotes -> Subset list of emotes -> can be null
//      -> list consists of emote hashes
//  first-msg -> whether first msg
//  flags -> possibly flags on user suspicion?
//  id -> user id, less unique than client nonce
//  mod -> whether user is mod or not (broadcaster is not mod)
//  returning-chatter
//  room-id
//  subscriber
//  tmi-sent-ts
//  turbo
//  user-id
//  user-type
//  emotes-raw
//  badge-info-raw
//  badges-raw
//  username
//  message-type

client.on('message', (channel, tags, message, self) =>{
    const isBot = tags.username.toLowerCase() == process.env.TWITCH_BOT_USERNAME.toLowerCase();

    if(isBot){
        return;
    }

    const [raw, command, argument] = message.match(regexCommand);

    const { response } = commands[command] || {};

    if(typeof response === 'function') {
        client.say(channel, response(tags.username));
    } else if(typeof response === 'string'){
        client.say(channel, response);
    }

    /*if( command ) {
        client.say(channel, `You said ${command} with arguments ${argument}`)
    }*/

    // keep log of chat
    console.log(`${tags['display-name']}: ${message}`);
});