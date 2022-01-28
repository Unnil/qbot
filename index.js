const { Collection } = require("discord.js");
const { TOKENS, PREFIX, findFreeBot } = require("./util/Util");
const { generateBot } = require("./util/bot-builder");
const i18n = require("./util/i18n");

const clients = [];
const botsInUsage = [];

for (let i = 0; i < TOKENS.length; i++) {
  clients.push(generateBot(TOKENS[i]));
}

const orchestrator = clients[0]
orchestrator.prefix = PREFIX;

const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

orchestrator.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${orchestrator.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const freeBot = findFreeBot(clients, message)
  if(!freeBot)
    return message.reply(i18n.__("play.errorNotInSameChannel")).catch(console.error)

  const proxyMessage = {
    client: freeBot,
    channel: message.channel,
    member: message.member,
    guild: message.guild,
    author: message.author,
    reply: message.reply
  }

  const command = freeBot.commands.get(commandName) || freeBot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(proxyMessage.author.id)) {
    const expirationTime = timestamps.get(proxyMessage.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return proxyMessage.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(proxyMessage.author.id, now);
  setTimeout(() => timestamps.delete(proxyMessage.author.id), cooldownAmount);

  try {
    command.execute(proxyMessage, args);
  } catch (error) {
    console.error(error);
    proxyMessage.reply(i18n.__("common.errorCommand")).catch(console.error);
  }
});