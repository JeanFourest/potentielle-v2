const { SlashCommandBuilder } = require("discord.js");
const { useQueue, QueueRepeatMode } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop") // Command name
    .setDescription("Loop the queue in different modes") // Command description
    .addNumberOption((option) =>
      option
        .setName("mode") // Option name
        .setDescription("The loop mode") // Option description
        .setRequired(true) // Option is required
        .addChoices(
          {
            name: "Off",
            value: QueueRepeatMode.OFF,
          },
          {
            name: "Track",
            value: QueueRepeatMode.TRACK,
          },
          {
            name: "Queue",
            value: QueueRepeatMode.QUEUE,
          },
          {
            name: "Autoplay",
            value: QueueRepeatMode.AUTOPLAY,
          }
        )
    ),

  async execute(interaction) {
    // Get the current queue
    const queue = useQueue();

    if (!queue) {
      return interaction.reply(
        "This server does not have an active player session."
      );
    }

    // Get the loop mode
    const loopMode = interaction.options.getNumber("mode");

    // Set the loop mode
    queue.setRepeatMode(loopMode);

    let msg = "";
    switch (loopMode) {
      case QueueRepeatMode.OFF:
        msg = "Looping is now turned off.";
        break;
      case QueueRepeatMode.TRACK:
        msg = "Looping the current track.";
        break;
      case QueueRepeatMode.QUEUE:
        msg = "Looping the entire queue.";
        break;
      case QueueRepeatMode.AUTOPLAY:
        msg = "Autoplay is now enabled.";
        break;
      default:
        return interaction.reply("Invalid loop mode selected.");
    }

    // Send a confirmation message
    return interaction.reply(msg);
  },
};
