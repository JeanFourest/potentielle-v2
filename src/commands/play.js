const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { useMainPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in a voice channel")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    // Defer the reply to prevent timeout
    await interaction.deferReply();

    // Get the player instance
    const player = useMainPlayer();
    // Get the song query from the user input
    const query = interaction.options.getString("song", true);

    // Get the voice channel of the user
    const voiceChannel = interaction.member.voice.channel;

    // Check if the user is in a voice channel
    if (!voiceChannel) {
      return interaction.editReply(
        "You need to be in a voice channel to play music!"
      );
    }

    // Check if the bot is already playing in a different voice channel
    if (
      interaction.guild.members.me.voice.channel &&
      interaction.guild.members.me.voice.channel !== voiceChannel
    ) {
      return interaction.editReply(
        "I am already playing in a different voice channel!"
      );
    }

    // Check if the bot has permission to join the voice channel
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Connect
      )
    ) {
      return interaction.editReply(
        "I do not have permission to join your voice channel!"
      );
    }

    // Check if the bot has permission to speak in the voice channel
    if (
      !interaction.guild.members.me
        .permissionsIn(voiceChannel)
        .has(PermissionsBitField.Flags.Speak)
    ) {
      return interaction.editReply(
        "I do not have permission to speak in your voice channel!"
      );
    }

    try {
      // Play the song in the voice channel
      const result = await player.play(voiceChannel, query, {
        nodeOptions: {
          metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
        },
      });

      // Reply to the user that the song has been added to the queue
      return interaction.editReply(
        `${result.track.title} has been added to the queue!`
      );
    } catch (error) {
      // Handle any errors that occur
      console.error(error);
      return interaction.editReply("An error occurred while playing the song!");
    }
  },
};
