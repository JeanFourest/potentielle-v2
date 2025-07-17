const { GuildQueueEvent } = require("discord-player");

module.exports = {
  name: GuildQueueEvent.PlayerStart,
  execute(queue, track) {
    console.log(`[PLAYER START] Playing: ${track.title}`);
  },
};
