const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");
const {
  SoundCloudExtractor,
  SpotifyExtractor,
  AppleMusicExtractor,
  VimeoExtractor,
} = require("@discord-player/extractor");
const { YoutubeiExtractor } = require("discord-player-youtubei");

require("dotenv").config();

const { execSync } = require("child_process");
console.log(execSync("ffmpeg -version").toString());

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
  /* await player.extractors.loadMulti(DefaultExtractors);
  await player.extractors.register(YoutubeiExtractor, {}) */

  await player.extractors.register(YoutubeiExtractor, {});
  await player.extractors.register(SoundCloudExtractor, {});
  await player.extractors.register(SpotifyExtractor, {});
  await player.extractors.register(AppleMusicExtractor, {});
  await player.extractors.register(VimeoExtractor, {});
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
    await initializePlayer();
    await client.login(TOKEN);
    console.log("Bot started successfully!");
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Start the bot
startBot();
