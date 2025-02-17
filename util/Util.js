exports.canModifyQueue = (member) => member.voice.channelID === member.guild.voice.channelID;

let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

exports.TOKENS = config ? config.TOKENS.split(",") : process.env.TOKENS.split(",");
exports.REDIS_URL = config ? config.REDIS_URL : process.env.REDIS_URL;
exports.SOUNDCLOUD_CLIENT_ID = config ? config.SOUNDCLOUD_CLIENT_ID : process.env.SOUNDCLOUD_CLIENT_ID;
exports.PREFIX = (config ? config.PREFIX : process.env.PREFIX) || "/";
exports.MAX_PLAYLIST_SIZE = (config ? config.MAX_PLAYLIST_SIZE : parseInt(process.env.MAX_PLAYLIST_SIZE)) || 10;
exports.PRUNING = (config ? config.PRUNING : (process.env.PRUNING === 'true' ? true : false));
exports.STAY_TIME = (config ? config.STAY_TIME : parseInt(process.env.STAY_TIME)) || 30;
exports.DEFAULT_VOLUME = (config ? config.DEFAULT_VOLUME : parseInt(process.env.DEFAULT_VOLUME)) || 100;
exports.LOCALE = (config ? config.LOCALE : process.env.LOCALE) || "en";


/**
 * Spotify
 */
const Spotify = require('node-spotify-api');
SPOTIFY_CLIENT_ID = config ? config.SPOTIFY_CLIENT_ID : process.env.SPOTIFY_CLIENT_ID;
SPOTIFY_SECRET_ID = config ? config.SPOTIFY_SECRET_ID : process.env.SPOTIFY_SECRET_ID;
exports.Spotify = new Spotify({
  id: SPOTIFY_CLIENT_ID,
  secret: SPOTIFY_SECRET_ID
});
