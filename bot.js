var Discord = require('discord.io');
var logger = require('winston');
var config = require('./config.json');
var fs = require('fs');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});




//Pre-flight Checks
var preflight = true;
if (!config.token || config.token === '') {
    preflight = false;
    logger.error('No token in config');
}

if (!config.serverID || config.serverID === '') {
    preflight = false;
    logger.error('No serverID in config')
}

if (config.features.voiceStateUpdates && config.sound_filename === '') {

    if (config.sound_filename === '') {
        preflight = false;
        logger.error('sound_file name must be set if using voiceStateUpdates feature');
    }

    var soundFile = fs.readFileSync(config.sound_filename);
    if (!soundFile) {
        preflight = false;
        logger.error('Unable to read sound file');
    }
}

if (!preflight) {
    logger.error('Please resolve config error(s) before continuing.');
}

var roomMonitor = true;
var roomIDs = [];

if (config.rooms.length > 0) {
    logger.info('Room IDs found - entering room monitor mode.');

    roomMonitor = true;
    roomIDs = config.rooms;
} else {
    logger.info('No Room IDs found - entering promiscuous mode.');

    roomMonitor = false;
    roomIDs = [];
}

var textCommandResponseRoom = false;

if (config.command_reporting_text_room == "") {
    logger.info('Text command room ID NOT found - responding to commands globally.');
} else {
    logger.info('Text command room ID found - responding to commands in set room.');

    textCommandResponseRoom = true;
}

//END Pre-flight




logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: config.token,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    logger.info('Bot Ready');
});

var sendJoinVoiceMessage = function(chanID) {
    if (chanID) {
        bot.joinVoiceChannel(chanID, function() {
            bot.getAudioContext(chanID, function(error, stream) {
                if (error) {
                    logger.info('An error occurred when joining context');
                    return;
                }

                fs.createReadStream(config.sound_filename).pipe(stream, {end: false});

                stream.on('done', function() {
                    bot.leaveVoiceChannel(chanID)
                });
            });
        });
    }
};

// VOICE UDPATES
if (config.features.voiceStateUpdates) {
    bot.on('voiceStateUpdate', function (evt) {
        if (roomMonitor) {
            roomIDs.forEach(function(id) {
                if (id == evt.d.channel_id) {
                    sendJoinVoiceMessage(evt.d.channel_id);
                }
            }, this);
        } else {
            sendJoinVoiceMessage(evt.d.channel_id);
        }
    });
}

// TEXT COMMANDS
var processCommandResponse = function(user, userID, channelID, message) {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    switch(cmd) {
        // !ping
        case 'ping':
            bot.sendMessage({
                to: channelID,
                message: 'Pong!'
            });
            break;
        case 'rogue':
            bot.sendMessage({
                to: channelID,
                message: 'You mean "Rouge" surely?',
                tts: true
            });
            break;
        // Just add any case commands if you want to..
    }
};

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        if (textCommandResponseRoom) {
            if (channelID == config.command_reporting_text_room) {
                processCommandResponse(user, userID, channelID, message);
            }
        } else {
            processCommandResponse(user, userID, channelID, message);
        }
    }
});