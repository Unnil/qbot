const { Collection } = require("discord.js");
const { createClient } = require("redis");
const { TOKENS, PREFIX, REDIS_URL, findFreeBot } = require("./util/Util");
const { generateBot } = require("./util/bot-builder");
const i18n = require("./util/i18n");
const AsyncLock = require('async-lock');

(async () => {

  const redisClient = createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();
  console.log('Redis started')

  const lock = new AsyncLock();
  const clients = [];
  const botsInUsage = [];

  const cooldowns = new Collection();
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getCommandArguments = (client, message) => {
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    return message.content.slice(matchedPrefix.length).trim().split(/ +/);
  }

  const processMessage = (client, message) => {
      if (message.author.bot) return;
      if (!message.guild) return;
    
      const args = getCommandArguments(client, message);
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

  const CanBotAttendMessages = (actualClientId, channelId) => {
    
    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];    

      if(c.voice.connections.toJSON().length > 0){
        // I'm the client and I'm connected to the user channel
        if(c.user.id == actualClientId && channelId == c.voice.connections.toJSON()[0].channel)
          return true;

        // I'm the client but I'm connected in another channel
        if(c.user.id == actualClientId && channelId != c.voice.connections.toJSON()[0].channel)
          return false;

        // I'm not the client and I'm connected to the user channel
        if(channelId == c.voice.connections.toJSON()[0].channel)
          return false;
      }
    }

    return true;
  }

  // The bots are in use in other channels different than user's channel
  const AllBotsAreWorking = (channelId) => {
    let counter = 0;
    for (let i = 0; i < clients.length; i++) {
      const connections = clients[i].voice.connections.toJSON();
      if(connections.length > 0 && connections[0].channel !== channelId)
        counter++;
    }
    return counter === clients.length;
  }

  for (let i = 0; i < TOKENS.length; i++) {
    const client = generateBot(TOKENS[i])
    clients.push(client);

    client.on("message", async (message) => {

      // locking the same message between the different bots to decide who will attend it
      lock.acquire(message.id, async () => {
        
        const userChannel = message.member.voice.channel;
        if(!userChannel)
          return;

        if(!CanBotAttendMessages(client.user.id, userChannel.id)){
          const commandArguments = getCommandArguments(client, message)
          if(commandArguments){
            const commandName = commandArguments.shift().toLowerCase();
            
            // when each bot is working in another channel we need to notify the user
            if(commandName === "play" && i === 0 && AllBotsAreWorking(userChannel.id))
              return message.reply(i18n.__("common.unavailableBots")).catch(console.error); 
          }
          return;
        }

        // many bots are available to attend the message but just the first one would be in charge
        const owner = await redisClient.get(message.id);
        if(owner)
          return;

        await redisClient.set(message.id, client.user.id, {EX: 10});  
        processMessage(client, message);   

      }, (err, ret) => {
        if(err)
          console.error(err)
      });
      
    });

  }

})();

