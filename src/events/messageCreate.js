const { Events } = require("discord.js");
const {
  replyOrFollowUp,
  addMessageToDatabase,
  openaiResponse,
} = require("../utils/utils");

const pool = require("../db/db");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore messages from bots
    if (message.author.bot) return;

    const bot = message.client.user;
    const user = message.author;

    if (message.content.includes(`<@${bot.id}>`)) {
      const cleanedContent = message.content.replace(
        new RegExp(`^<@!?${bot.id}>\\s*`, "i"),
        ""
      );

      // Fetch the last 20 messages from the channel in reverse order
      // and format them for OpenAI
      const conversation = await pool.query(
        `SELECT content, user_id, username
        FROM (
          SELECT content, user_id, username, created_at
          FROM messages
          WHERE channel_id = $1
          ORDER BY created_at DESC
          LIMIT 20
        ) AS recent_messages
        ORDER BY created_at ASC;`,
        [message.channel.id]
      );

      const openaiMessages = conversation.rows.map((row) => ({
        role: row.user_id === user.id ? "user" : "assistant",
        content: `${
          row.user_id === user.id ? `${row.username} | ${row.user_id} : ` : ""
        } ${row.content}`,
      }));

      openaiMessages.push({
        role: "user",
        content: `${user.username} : ${cleanedContent}`,
      });

      console.log(openaiMessages);

      const response = await openaiResponse(openaiMessages);

      replyOrFollowUp(message, response.output_text);

      await addMessageToDatabase(
        pool,
        message.channel.id,
        user.id,
        user.username,
        cleanedContent
      );

      await addMessageToDatabase(
        pool,
        message.channel.id,
        bot.id,
        null,
        response.output_text
      );
    }
  },
};
