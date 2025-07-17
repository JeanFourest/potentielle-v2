const { useTimeline } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause") // Command name
    .setDescription("Pause the currently playing song"),

  async execute(interaction) {
    // Get the queue's timeline
    const timeline = useTimeline();

    if (!timeline) {
      return interaction.reply(
        "This server does not have an active player session."
      );
    }

    // Invert the pause state
    const wasPaused = timeline.paused;

    wasPaused ? timeline.resume() : timeline.pause();

    // If the timeline was previously paused, the queue is now back to playing
    return interaction.reply(
      `The player is now ${wasPaused ? "playing" : "paused"}.`
    );
  },
};
