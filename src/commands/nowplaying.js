const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Display the currently playing song"),

  async execute(interaction) {
    // Get the current queue
    const queue = useQueue();

    if (!queue) {
      return interaction.reply(
        "This server does not have an active player session."
      );
    }

    // Get the currently playing song
    const currentSong = queue.currentTrack;

    // Check if there is a song playing
    if (!currentSong) {
      return interaction.reply("No song is currently playing.");
    }

    // Send the currently playing song information
    return interaction.reply({
      embeds: [
        {
          title: "Now Playing",
          description: `${currentSong.title} - ${currentSong.author}`,
          fields: [
            { name: "Duration", value: currentSong.duration, inline: true },
            {
              name: "Link",
              value: `[🔗 Listen on ${currentSong.source}](${currentSong.url})`,
              inline: false,
            },
          ],
          thumbnail: { url: currentSong.thumbnail },
        },
      ],
    });
  },
};
