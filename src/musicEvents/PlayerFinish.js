const { GuildQueueEvent } = require("discord-player");

module.exports = {
  name: GuildQueueEvent.PlayerFinish,
  execute(queue, tracks) {
    console.log(`[TRACKS ADDED] ${tracks.length} tracks added`);
  },
};
