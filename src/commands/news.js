const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { openaiResponse } = require("../utils/utils");
const { pool } = require("../db/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("news")
    .setDescription("Get the latest news from a specific country or topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("Specify a topic to get news about")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("date_time")
        .setDescription(
          "Specify the time in UTC for recurring news ex: 8:00 or 21:30"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      // Reply to the interaction
      await interaction.deferReply();

      const topic = interaction.options.getString("topic");
      const date_time = interaction.options.getString("date_time");

      let databaseTime = null;

      if (date_time) {
        // Convert the time for postgreSQL
        try {
          const [hours, minutes] = date_time.split(":").map(Number);
          if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new Error("Invalid time format: " + date_time);
          }

          await pool.query(
            "INSERT INTO news (user_id, topic, scheduled_hour, scheduled_minute) VALUES ($1, $2, $3, $4);",
            [interaction.user.id, topic, hours, minutes]
          );

          return interaction.editReply(
            `Daily news registered for ${date_time} UTC about ${
              topic || "general news"
            }`
          );
        } catch (error) {
          console.error("error date", error);
          return interaction.editReply(
            "Invalid time format. Please use HH:MM format."
          );
        }
      }

      const content = `Get the latest news about ${topic || "the world"}`;

      // Get the news content
      const newsContent = await openaiResponse(
        [
          {
            role: "user",
            content: content,
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

      // Check if the response is valid
      if (!newsContent || !newsContent.output_text) {
        return interaction.editReply("Failed to fetch the news.");
      }

      for (const news of newsContent.output_text.split("--END-OF-ARTICLE--")) {
        if (news.trim() === "") continue; // Skip empty news items

        const mainEmbed = new EmbedBuilder()
          .setDescription(news.trim())
          .setColor(0x0099ff)
          .setTimestamp()
          .setFooter({ text: "News aggregated from web search" });
        // Send each news item as a separate embed
        await interaction.followUp({
          embeds: [mainEmbed],
        });
      }
    } catch (error) {
      console.log(error);
      return interaction.reply("An error occured while fetching the news.");
    }
  },
};
