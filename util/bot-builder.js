const { Client, Collection } = require("discord.js");
const { PREFIX } = require("./Util");
const { readdirSync } = require("fs");
const { join } = require("path");

exports.generateBot = (token) => {
  const client = new Client({
    disableMentions: "everyone",
    restTimeOffset: 0
  });
  
  client.login(token);
  client.commands = new Collection();  
  client.prefix = PREFIX;
  client.queue = new Map();

  /**
   * Client Events
   */
  client.on("ready", () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
  });
  client.on("warn", (info) => console.log(info));
  client.on("error", console.error);
  

  /**
   * Import all commands
   */
  const commandFiles = readdirSync(join(__dirname, "../commands")).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(join(__dirname, "../commands", `${file}`));
    client.commands.set(command.name, command);
  }

  return client;
}