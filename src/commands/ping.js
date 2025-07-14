const { SlashCommandBuilder } = require("discord.js");
const { replyOrFollowUpEmbed } = require("../utils/utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await replyOrFollowUpEmbed(interaction, "Pong!");
  },
};
