const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { openaiResponse } = require("../utils/utils");

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
        .setName("recurring")
        .setDescription("Specify wether it's daily, weekly, or monthly news")
        .setRequired(false)
        .addChoices(
          { name: "Daily", value: "daily" },
          { name: "Weekly", value: "weekly" },
          { name: "Monthly", value: "monthly" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("date_time")
        .setDescription(
          "Specify the date and time zone for recurring news ex: 8:00-AM-08/01/2025-GMT+1"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    // Reply to the interaction
    await interaction.deferReply();

    const topic = interaction.options.getString("topic");
    const recurring = interaction.options.getString("recurring");
    const date_time = interaction.options.getString("date_time");

    let databaseTime = null;

    if (recurring || date_time) {
      if (!recurring || !date_time) {
        return interaction.editReply(
          "Please provide both recurring frequency and date."
        );
      }

      // Convert the time for postgreSQL
      try {
        const [time, ampm, date, timeZone] = date_time.split("-");

        const [hours, minutes] = time.split(":").map(Number);
        let adjustedHours = hours;
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          throw new Error("Invalid time format: " + time);
        }
        if (ampm.toLowerCase() === "pm" && hours < 12) {
          adjustedHours += 12; // Convert PM to 24-hour format
        } else if (ampm.toLowerCase() === "am" && hours === 12) {
          adjustedHours = 0; // Convert 12 AM to 0 hours
        }

        const [day, month, year] = date.split("/").map(Number);

        // Parse timezone offset (e.g., "GMT+1", "GMT-5")
        let timezoneOffset = 0;
        if (timeZone) {
          const match = timeZone.match(/GMT([+-]\d+)/);
          if (match) {
            timezoneOffset = parseInt(match[1]);
          }
        }

        // Adjust hours for timezone - convert to UTC
        const utcHours = adjustedHours - timezoneOffset;

        // Create date in UTC
        databaseTime = new Date(
          Date.UTC(year, month - 1, day, utcHours, minutes)
        ).toISOString();

        console.log(`Original : ${date_time}`);
        console.log(`UTC time: ${databaseTime}`);
      } catch (error) {
        console.error("error date", error);
        return interaction.editReply(
          "Invalid time format. Please use HH:MM AM/PM format."
        );
      }
    }

    // Get the news content
    const newsContent = await openaiResponse(
      [
        {
          role: "user",
          content: `Get the latest news about ${topic || "the world"}`,
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
  },
};
