import { Client, GatewayIntentBits } from "discord.js";
import config from "../../config/index";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let isReady = false;

async function ensureClientReady() {
  if (!isReady) {
    if (!config.discord?.token) {
      throw new Error("Discord token is missing in config file.");
    }
    await client.login(config.discord.token);
    isReady = true;
  }
}

export async function fetchDiscordProfile(discordId: string) {
  try {
    await ensureClientReady();
    const user = await client.users.fetch(discordId);

    return {
      username: user.username,
      // Inalis na natin ang dynamic: true; automatic nang magiging .gif kung animated ito
      avatar: user.displayAvatarURL({ size: 1024 }) ?? "",
      banner: user.bannerURL({ size: 1024 }) ?? "",
    };
  } catch (error) {
    console.error(
      `Failed to fetch Discord profile for ID ${discordId}:`,
      error,
    );
    return null;
  }
}
