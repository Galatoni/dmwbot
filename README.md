# dmwbot

## Quickstart
* Enable an application and bot by following https://github.com/Chikachi/DiscordIntegration/wiki/How-to-get-a-token-and-channel-ID-for-Discord and filling in the settings in config.json for token and serverID
* Decide which features you want activated:
** channelJoinNotification - TTS notifications when anyone joins a text channel
** voiceStateUpdates - TTS updates when a user joins a channel to the associated text channel

## Notes
For now this is very much a work in progress, as such there are a few problems. They will likely be solved in future updates, but for now, this is where we are.
* voiceStateUpdates map a voice channel name to an similarly named text channel. The required format is as follows:
** Voice channel named: 'NAME OF CHANNEL - Voice' maps and sends TTS notifications to 'name_of_channel_text'
** The notifications currently only work when joining
** It's likely going to have some teething trouble with some mapping combinations
* TTS permissions must be granted to the BOT account
* TTS will always speak the bots name first - I can't get around this.
