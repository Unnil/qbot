const { Collection } = require("discord.js");
const { createClient } = require("redis");
const { TOKENS, PREFIX, findFreeBot } = require("./util/Util");
const { generateBot } = require("./util/bot-builder");
const i18n = require("./util/i18n");
const AsyncLock = require('async-lock');

(async () => {
  const client = createClient({
    url: 'redis://default:IGnramAqYmy9J2AFb2hU2b1iDtmpw7tp@redis-14553.c283.us-east-1-4.ec2.cloud.redislabs.com:14553'
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  console.log('Redis started')
})();

const lock = new AsyncLock();
const clients = [];
const botsInUsage = [];

// TODO: cooldown should be different by each bot
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const processMessage = (client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
  
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
  
    const [, matchedPrefix] = message.content.match(prefixRegex);
  
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
  
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
  
    if (!command) return;
  
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }
  
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;
  
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
  
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
        );
      }
    }
  
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply(i18n.__("common.errorCommand")).catch(console.error);
    }
}

for (let i = 0; i < TOKENS.length; i++) {
  const client = generateBot(TOKENS[i])
  clients.push(client);

  client.on("message", async (message) => {

    
    lock.acquire(message.id, async () => {

      //Esta en uso y no estoy en el channel
      if(client.voice.connections.toJSON().length){
        console.log('esta en uso');
        return;
      }

      //mi channel
      //message.guild.me.voice.channel

      //estoy en el channel con el bot
      channel === message.guild.me.voice.channel

      //TODO: someone get the ownership?
      const v = await client.get(message.id);
      if(v){
        console.log('alguien mas se encarga');
        return;
      }
      
      await client.set('key', 'value');  
      
      console.log()
      
      processMessage(client, message);      
    }, (err, ret) => {
      console.error(err)
    }, opts);

    
    
  });

}
