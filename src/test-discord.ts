import { Client, GatewayIntentBits } from "discord.js";
import config from "./config"; // adjust path kung saan talaga located config.ts

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const discordId = "742599991914397726"; // MACARONI

client.once("ready", async () => {
  console.log(`Bot logged in as ${client.user?.tag}`);

  try {
    const user = await client.users.fetch(discordId);

    const result = {
      id: user.id,
      username: user.username,
      displayName: user.globalName,
      avatar: user.displayAvatarURL({
        size: 1024,
        extension: "png",
      }),
      banner:
        user.bannerURL({
          size: 1024,
          extension: "png",
        }) ?? "",
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }

  client.destroy();
});

client.login(config.discord.token);
