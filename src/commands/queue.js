const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue") // Command name
    .setDescription("Display the current queue"),

  async execute(interaction) {
    // Get the current queue
    const queue = useQueue();

    if (!queue) {
      return interaction.reply(
        "This server does not have an active player session."
      );
    }

    // Get the current track
    const currentTrack = queue.currentTrack;

    // Get the upcoming tracks
    const upcomingTracks = queue.tracks.toArray().slice(0, 10);

    // Create a message with the current track and upcoming tracks
    const message = [
      `**Now Playing:** ${currentTrack.title} - ${currentTrack.author}`,
      "",
      "**Upcoming Tracks:**",
      ...upcomingTracks.map((track, _) => `${track.title} - ${track.author}`),
      "",
      `**Queue Size** ${queue.tracks.size}`,
    ].join("\n");

    // Send the message
    return interaction.reply(message);
  },
};
