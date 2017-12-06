# dmwbot

## Quickstart
1. Ensure you have node installed
2. From the install directory run `npm install`
3. Enable an application and bot by following https://github.com/Chikachi/DiscordIntegration/wiki/How-to-get-a-token-and-channel-ID-for-Discord and filling in the settings in `config.json` for `token` and `serverID`
4. Decide which features you want activated by settings the corresponding flag in `config.json`:
* `channelJoinNotification` - TTS notifications when anyone joins a text channel
* `voiceStateUpdates` - TTS updates when a user joins a channel to the associated text channel
5. Run node bot.js from the install server to start

## Notes
For now this is very much a work in progress, as such there are a few problems. They will likely be solved in future updates, but for now, this is where we are.
1. `voiceStateUpdates` map a voice channel name to a similarly named text channel. The required format is as follows:

Voice channel: `NAME OF CHANNEL - Voice` maps and sends TTS notifications to text channel: `name_of_channel_text`. This is to get over limitations in channel state reporting in discord

* These notifications currently only work when joining
* It's likely going to have some teething trouble with some mapping combinations

2. TTS permissions must be granted to the BOT account
3. TTS Must be enabled on your server
3. TTS will always speak the bots name first - I can't get around this.
