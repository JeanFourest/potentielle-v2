const fs = require("node:fs");
const path = require("node:path");
const cron = require("node-cron");
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const { Player } = require("discord-player");
const { pool } = require("./db/db");
const {
  SoundCloudExtractor,
  SpotifyExtractor,
  AppleMusicExtractor,
  VimeoExtractor,
} = require("@discord-player/extractor");
const { initializeDatabase } = require("./db/db");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { openaiResponse } = require("./utils/utils");

const { TOKEN } = process.env;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

const player = new Player(client);

// Initialize player in an async function
async function initializePlayer() {
  // Load all default extractors for better compatibility
  console.log("[EXTRACTOR] Registering extractors...");

  await player.extractors.register(YoutubeiExtractor);
  await player.extractors.register(SoundCloudExtractor);
  await player.extractors.register(SpotifyExtractor);
  await player.extractors.register(AppleMusicExtractor);
  await player.extractors.register(VimeoExtractor);

  console.log("[EXTRACTOR] All extractors registered successfully.");
}

// Add debug events to understand what's happening
player.events.on("debug", (queue, message) => {
  console.log(`[DEBUG] ${message}`);
});

player.events.on("error", (queue, error) => {
  console.log(`[ERROR] ${error.message}`);
});

player.events.on("playerError", (queue, error) => {
  console.log(`[PLAYER ERROR] ${error.message}`);
});

player.events.on("audioTrackAdd", (queue, track) => {
  console.log(`[TRACK ADDED] ${track.title} - Duration: ${track.duration}`);
});

player.events.on("audioTracksAdd", (queue, tracks) => {
  console.log(`[TRACKS ADDED] ${tracks.length} tracks added`);
});

player.events.on("playerSkip", (queue, track) => {
  console.log(`[PLAYER SKIP] Skipped: ${track.title}`);
});

player.events.on("emptyQueue", (queue) => {
  console.log("[QUEUE] Queue is empty, leaving voice channel");
});

player.events.on("disconnect", (queue) => {
  console.log("[DISCONNECT] Disconnected from voice channel");
});

const foldersPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((file) => file.endsWith(".js"));

// cronjobs
const fetchNews = async () => {
  try {
    // utc times
    const now = new Date();

    const currentTime = new Date(now);
    currentTime.setUTCHours(now.getHours(), now.getMinutes(), 0, 0);

    console.log(
      `[NEWS FETCH] Checking for news at ${currentTime.toISOString()}`
    );

    const news = await pool.query(
      `SELECT * FROM news WHERE scheduled_time = $1`,
      [currentTime.toISOString()]
    );

    return news.rows;
  } catch (e) {
    console.log("[ERROR] error fetching news");
    return [];
  }
};

const initializeCronJobs = async () => {
  console.log("[CRONJOB] Started cronjobs");
  cron.schedule("* * * * *", async () => {
    try {
      const newsList = await fetchNews();
      for (const news of newsList) {
        const user = await client.users.fetch(news.user_id);
        if (user) {
          const newsContent = await openaiResponse(
            [
              {
                role: "user",
                content: `Get the latest news about ${
                  news.topic || "the world"
                }`,
              },
            ],
            `You are a news aggregator. 
          provide the latest news based on the user's request. 
          if no country or topic is specified, provide general news about the world. 
          format the response as a list of news articles with titles and summaries. 
          as short as possible. 
          always use web search to find the latest news.
          add a separator between each news article in the following.
          only return the top 3 news articles.
          use the following format: 
          "
          **[title]**
          [summary]
          --END-OF-ARTICLE--
          **[title]**
          [summary]
          --END-OF-ARTICLE--
          **[title]**
          [summary]
          --END-OF-ARTICLE--
          "`,
            [{ type: "web_search_preview" }]
          );

          await user.send(`📰 news about ${news.topic}`);

          for (const newsData of newsContent.output_text.split(
            "--END-OF-ARTICLE--"
          )) {
            if (newsData.trim() === "") continue; // Skip empty news items

            const mainEmbed = new EmbedBuilder()
              .setDescription(newsData.trim())
              .setColor(0x0099ff)
              .setTimestamp()
              .setFooter({ text: "News aggregated from web search" });
            // Send each news item as a separate embed
            await user.send({
              embeds: [mainEmbed],
            });
          }
        } else {
          console.log(
            `[NEWS ERROR] Could not fetch user with ID: ${news.user_id}`
          );
        }
      }
    } catch (error) {
      console.log(`[ERROR NEWS] ${error}`);
    }
  });
};

// Loop through each command file and set it up
for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const musicEventsPath = path.join(__dirname, "musicEvents");
const musicEventFiles = fs
  .readdirSync(musicEventsPath)
  .filter((file) => file.endsWith(".js"));

for (const musicFile of musicEventFiles) {
  const musicFilePath = path.join(musicEventsPath, musicFile);
  const musicEvent = require(musicFilePath);

  if (musicEvent.name && musicEvent.execute) {
    player.events.on(musicEvent.name, (...args) => musicEvent.execute(...args));
    console.log(
      `[MUSIC EVENT] Registered event: ${musicEvent.name} from ${musicFilePath}`
    );
  } else {
    console.warn(
      `[WARNING] The music event at ${musicFilePath} is missing a required "name" or "execute" property.`
    );
  }
}

// Initialize and start the bot
async function startBot() {
  try {
    console.log("Starting bot initialization...");

    await initializeDatabase();

    await initializePlayer();

    await client.login(TOKEN);

    await initializeCronJobs();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Start the bot
startBot();
