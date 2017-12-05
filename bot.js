var Discord = require('discord.io');
var logger = require('winston');
var config = require('./config.json');

// CHANNEL MAP UTILITY CLASS
var ChannelMap = function(channels) {
    this.TEXT_EXTENSION = 'text';
    this.VOICE_EXTENSION = '-_Voice';

    this.channels = channels;

    ChannelMap.prototype.getIdForChannelName = function(name) {
        var id = false;

        Object.keys(this.channels).map(function(key) {
            if (this.channels[key].name === name) {
                id = this.channels[key].id;
            }
        }, this);

        return id;
    };

    ChannelMap.prototype.getNameForChannelId = function(id) {
        var name = false;

        Object.keys(this.channels).map(function(key) {
            if (this.channels[key].id === id) {
                name = this.channels[key].name
            }
        }, this);

        return name;
    };

    ChannelMap.prototype.getTextChannelIdForVoiceChannelId = function(voiceChannelId) {
        var voiceChannelName = this.getNameForChannelId(voiceChannelId);
        return this.getIdForChannelName(this.convertVoiceChannelNameToTextChannelName(voiceChannelName));
    };

    ChannelMap.prototype.convertVoiceChannelNameToTextChannelName = function(voiceChannelName) {
        return voiceChannelName.replace(/\s/g, '_')
            .replace(this.VOICE_EXTENSION, this.TEXT_EXTENSION)
            .toLowerCase();
    };
};
//CHANNEL MAP UTILITY CLASS END

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});

var generateJoinMessage = function(author) {
    var template = '%s has joined the channel';
    return template.replace('%s', author.username);
};

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

    logger.info('Processing channel information...');
    this.channelMap = new ChannelMap(bot.channels);
    logger.info('Bot Ready');
});

var sendTTSMessage = function(textChannelId) {
    bot.sendMessage({
        to: textChannelId,
        message: "User has joined your channel",
        tts: true
    });
};

if (config.features.voiceStateUpdates) {
    bot.on('voiceStateUpdate', function (evt) {
        if (evt.d.channel_id) {
            var textChannelId = this.channelMap.getTextChannelIdForVoiceChannelId(evt.d.channel_id);

            if (textChannelId) {
                sendTTSMessage(textChannelId);
            }
        }
    });
}

bot.on('message', function (user, userID, channelID, message, evt) {

    // Listener for new entry messages - sends TTS response. Activated in config file.
    var TYPE_USER_HAS_ENTERED_THE_GAME = 7;
    if (config.features.channelJoinNotification && evt.d.type === TYPE_USER_HAS_ENTERED_THE_GAME) {
        bot.sendMessage({
            to: channelID,
            message: generateJoinMessage(evt.d.author),
            tts: true
        });
    }
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
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
    }
});