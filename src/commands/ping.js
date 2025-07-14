const { SlashCommandBuilder } = require("discord.js");
const { replyOrFollowUp } = require("../utils/utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await replyOrFollowUp(interaction, "Pong!");
  },
};
