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

  let freeBot = undefined

  for (let i = 0; i < clients.length; i++) {
    const { channel } = message.member.voice;
    const serverQueue = message.client.queue.get(message.guild.id);

    console.log('id is:', clients[i].user.id)
    const isInUse = clients[i].voice.connections.toJSON().length !== 0;

    //TODO: The bot is active in my channel
    if(channel && channel === message.guild.me.voice.channel)
      return clients[i];   
    
    //TODO: The bot is not active in my channel and is not active in any channel
    if(channel && channel !== message.guild.me.voice.channel && !isInUse)
      freeBot = clients[i];    
  }

  console.log('Channel free is', freeBot.user.id)
  return freeBot;

}