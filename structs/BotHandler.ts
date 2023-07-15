
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../utils/config";
import { Bot } from "./Bot";

export class BotHandler {
    public botArray = new Array<Bot>();
    public usedBots = new Array<boolean>();

    public constructor() {
        for (let i = 0; i < config.TOKENS.length; i++) {
            this.botArray[i] = new Bot(
                new Client({
                    intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.DirectMessages
                    ]
                }),
                config.TOKENS[i],
                i
            );
            this.usedBots[i] = false;
        }
    }

    public getFreeBot(){
        let freeBotIndex = this.usedBots.findIndex(used => {return used==false});
        console.log("pidieron bot libre:", freeBotIndex, "pero, esta libre?:", this.botArray[freeBotIndex])
        return this.botArray[freeBotIndex];
    }
}

