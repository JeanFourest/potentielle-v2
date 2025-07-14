const replyOrFollowUpEmbed = (interaction, message) => {
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

module.exports = {
  replyOrFollowUpEmbed,
};
