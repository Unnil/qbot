exports.canModifyQueue = (member) => member.voice.channelID === member.guild.voice.channelID;

let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

exports.TOKENS = config ? config.TOKENS : process.env.TOKENS;
exports.SOUNDCLOUD_CLIENT_ID = config ? config.SOUNDCLOUD_CLIENT_ID : process.env.SOUNDCLOUD_CLIENT_ID;
exports.PREFIX = (config ? config.PREFIX : process.env.PREFIX) || "/";
exports.MAX_PLAYLIST_SIZE = (config ? config.MAX_PLAYLIST_SIZE : parseInt(process.env.MAX_PLAYLIST_SIZE)) || 10;
exports.PRUNING = (config ? config.PRUNING : (process.env.PRUNING === 'true' ? true : false));
exports.STAY_TIME = (config ? config.STAY_TIME : parseInt(process.env.STAY_TIME)) || 30;
exports.DEFAULT_VOLUME = (config ? config.DEFAULT_VOLUME : parseInt(process.env.DEFAULT_VOLUME)) || 100;
exports.LOCALE = (config ? config.LOCALE : process.env.LOCALE) || "en";


exports.findFreeBot = (clients, message) => {

  for (let i = 0; i < clients.length; i++) {
    // const element = clients[0];    
    const { channel } = message.member.voice;
    const serverQueue = message.client.queue.get(message.guild.id);

    console.log('channel is:', channel);
    console.log('message channel is:', message.guild.me.voice.channel);

    // the bot is free or I'm in the channel with the bot
    if(channel && (serverQueue || channel === message.guild.me.voice.channel))
      return clients[i];
  }

  return undefined;

}