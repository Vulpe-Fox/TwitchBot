import dotenv from 'dotenv';
import { Client } from 'tmi.js';
import { 
    getUserCurrentGame, 
    setCurrentGame, 
    getCurrentGame, 
    getChannelIDFromName 
} from './statics/twitchcalls.js';

dotenv.config();

// define minutes
const second = 1000; //(ms)
const minute = 60 * second;

// store channel id for channel
const cID = await getChannelIDFromName(process.env.TWITCH_CHANNEL_NAME);

// command responses
const COMMANDS = {
    socials: {
        response: `twitter: https://twitter.com/Vulpescorsac_`
    },
    whoami: {
        response: (channel, context, argument) => {
            client.say(channel, `You are ${context.username}`);
        }
    },
    getgame: {
        response: (channel, context, argument) => {
            getCurrentGame(client, channel, cID);
        }
    },
}
const MODCOMMANDS = {
    setgame: {
        response: (channel, context, argument) => {
            //setCurrentGame(client, channel, cID, argument);
            return;
        }
    },
    so: {
        response: (channel, context, argument) => {
            if(argument.charAt(0) === '@'){
                shoutout(channel, argument.substring(1));
                return;
            }
            shoutout(channel, argument);
        }
    }
}

// think !meow or !hug @vulpefox
const REGEX_COMMAND = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
// think !compare @vulpefox @artiwuff
//const regexDoubleArgCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

// define new client
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

// timers:
setInterval(() => {
    client.say("#vulpefox", "Feel free to join the official Vulpefox discord here: https://discord.gg/dzqCaRE5a3");
}, minute * 35);
setInterval(() => {
    client.say("#vulpefox", `I'm now a Rogue Partner! Feel free to use code "FOXVERSE" at checkout for 20% off your order. Found a better deal? Feel free to use my referral link before filling up your order: https://rogueenergy.com/?ref=foxverse`);
}, minute * 32);
setInterval(() => {
    client.say("#vulpefox", "If you must know about the secret vulpe throne that I don't know how to use, it's right here: https://throne.com/vulpefox");
}, minute * 29);

// shout out
async function shoutout(channel, username) {
    let userCID = await getChannelIDFromName(username);
    let userGame = await getUserCurrentGame(client, channel, userCID);
    if(userGame == ""){
        userGame = "<no game>";
    }
    client.say(channel, `Here comes a fluffy foxy shoutout to @${username}, they were playing ${userGame} at https://twitch.tv/${username} AWOOOO!~`);
}

// context:
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
//  returning-chatter -> whether user is returning or not
//  room-id -> id of chatroom for user (external or internal)
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

client.on('message', async (channel, context, message) => {
    const isBot = context.username.toLowerCase() == process.env.TWITCH_BOT_USERNAME.toLowerCase();

    // keep log of chat
    console.log(`${context['display-name']}: ${message}`);

    if(isBot){
        return;
    }

    if(REGEX_COMMAND.test(message)){
        const [raw, command, argument] = message.match(REGEX_COMMAND);
        const { response } = COMMANDS[command] || {};
        const modResponse = MODCOMMANDS[command] || {};

        if(typeof response === 'function') {
            response(channel, context, argument);
        } else if(typeof response === 'string'){
            client.say(channel, response);
        }

        if(context.mod || context.username.toLowerCase == process.env.TWITCH_CHANNEL_NAME.toLowerCase){
            if(typeof modResponse["response"] === 'function') {
                modResponse["response"](channel, context, argument);
            } else if(typeof modResponse["response"] === 'string'){
                client.say(channel, response);
            }
        }
    }
});

client.on('redeem', (channel, username, rewardType, tags, message) => {
    switch(rewardType) {
        // Message that appears "highlighted" in the chat.
        case 'highlighted-message': break;
        // Message that skips the subscriber-only mode
        case 'skip-subs-mode-message': break;
        // Custom reward ID
        case '27c8e486-a386-40cc-9a4b-dbb5cf01e439': break;
    }
});

client.on('resub', (channel, username, months, message, userstate, methods) => {
    switch(rewardType) {
        // Message that appears "highlighted" in the chat.
        case 'highlighted-message': break;
        // Message that skips the subscriber-only mode
        case 'skip-subs-mode-message': break;
        // Custom reward ID
        case '27c8e486-a386-40cc-9a4b-dbb5cf01e439': break;
    }
});

client.on('raided', async (channel, username, viewers) => {
    shoutout(channel, username);
});

client.on('anonsubmysterygift', async (channel, numbOfSubs, methods, userstate) => {});
client.on('anonsubgift', async (channel, streakMonths, recipient, methods, userstate) => {});
client.on('automod', async (channel, msgID, message) => {});
client.on('ban', async (channel, username, reason, userstate) => {});
client.on('cheer', async (channel, userstate, message) => {});
client.on('connected', async (address, port) => {});
client.on('connecting', async (address, port) => {});
client.on('disconnected', async (reason) => {});
client.on('emoteonly', async (channel, enabled) => {});
client.on('followersonly', async (channel, enabled, length) => {});

    /*giftpaidupgrade(channel: string, username: string, sender: string, userstate: SubGiftUpgradeUserstate): void;
    hosted(channel: string, username: string, viewers: number, autohost: boolean): void;
    hosting(channel: string, target: string, viewers: number): void;
    join(channel: string, username: string, self: boolean): void;
    messagedeleted(channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate): void;
    mod(channel: string, username: string): void;
    mods(channel: string, mods: string[]): void;
    notice(channel: string, msgid: MsgID, message: string): void;
    part(channel: string, username: string, self: boolean): void;
    primepaidupgrade(channel: string, username: string, methods: SubMethods, userstate: PrimeUpgradeUserstate): void;

    // additional string literals for autocomplete
    
    roomstate(channel: string, state: RoomState): void;
    serverchange(channel: string): void;
    slowmode(channel: string, enabled: boolean, length: number): void;
    subgift(
        channel: string,
        username: string,
        streakMonths: number,
        recipient: string,
        methods: SubMethods,
        userstate: SubGiftUserstate,
    ): void;
    submysterygift(
        channel: string,
        username: string,
        numbOfSubs: number,
        methods: SubMethods,
        userstate: SubMysteryGiftUserstate,
    ): void;
    subscribers(channel: string, enabled: boolean): void;
    subscription(
        channel: string,
        username: string,
        methods: SubMethods,
        message: string,
        userstate: SubUserstate,
    ): void;
    timeout(channel: string, username: string, reason: string, duration: number, userstate: TimeoutUserstate): void;
    vips(channel: string, vips: string[]): void;
    whisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void;*/