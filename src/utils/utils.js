const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});
const fs = require("node:fs");

const replyOrFollowUp = (interaction, message) => {
  if (interaction) {
    if (interaction.replied) {
      return interaction.followUp(message);
    } else if (interaction.deferred) {
      return interaction.editReply(message);
    } else {
      return interaction.reply(message);
    }
  } else if (interaction) {
    return interaction.reply(message);
  }
};

const addMessageToDatabase = async (
  pool,
  channelId,
  userId,
  username,
  content
) => {
  try {
    await pool.query(
      "INSERT INTO messages (channel_id, user_id, username, content) VALUES ($1, $2, $3, $4)",
      [channelId, userId, username, content]
    );
    console.log("Message inserted successfully.");
  } catch (e) {
    console.error("Error inserting message into database:", e);
  }
};

const openaiResponse = async (content, intructions = "", tools = []) => {
  try {
    if (intructions.length === 0) {
      intructions = fs
        .readFileSync("potentielleV2Personality.txt", "utf8")
        .trim();
    }
    return await client.responses.create({
      model: "gpt-4o-mini",
      instructions: intructions,
      input: content,
      tools: tools,
    });
  } catch (e) {
    console.error(e);
    return { output_text: "An error occurred while processing your request." };
  }
};

module.exports = {
  replyOrFollowUp,
  addMessageToDatabase,
  openaiResponse,
};
