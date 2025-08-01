const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { pool } = require("../db/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("newslist")
    .setDescription("List or manage your scheduled news")
    .addSubcommand((subcommand) =>
      subcommand.setName("show").setDescription("Show all your scheduled news")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a scheduled news")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the news to remove")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "show") {
        const result = await pool.query(
          "SELECT * FROM news WHERE user_id = $1 ORDER BY scheduled_hour, scheduled_minute",
          [interaction.user.id]
        );

        if (result.rows.length === 0) {
          return interaction.editReply("You have no scheduled news.");
        }

        const embed = new EmbedBuilder()
          .setTitle("📰 Your Scheduled News")
          .setColor(0x0099ff)
          .setTimestamp();

        let description = "";
        for (const news of result.rows) {
          const timeStr = `${news.scheduled_hour
            .toString()
            .padStart(2, "0")}:${news.scheduled_minute
            .toString()
            .padStart(2, "0")}`;
          description += `**ID:** ${
            news.id
          }\n**Time:** ${timeStr} UTC\n**Topic:** ${
            news.topic || "General news"
          }\n\n`;
        }

        embed.setDescription(description);
        return interaction.editReply({ embeds: [embed] });
      } else if (subcommand === "remove") {
        const newsId = interaction.options.getInteger("id");

        const result = await pool.query(
          "DELETE FROM news WHERE id = $1 AND user_id = $2 RETURNING *",
          [newsId, interaction.user.id]
        );

        if (result.rows.length === 0) {
          return interaction.editReply(
            "News not found or you don't have permission to remove it."
          );
        }

        const removedNews = result.rows[0];
        const timeStr = `${removedNews.scheduled_hour
          .toString()
          .padStart(2, "0")}:${removedNews.scheduled_minute
          .toString()
          .padStart(2, "0")}`;

        return interaction.editReply(
          `✅ Removed scheduled news (ID: ${newsId}) for ${timeStr} UTC about "${
            removedNews.topic || "General news"
          }"`
        );
      }
    } catch (error) {
      console.error("Error in newslist command:", error);
      return interaction.editReply(
        "An error occurred while managing your news."
      );
    }
  },
};
