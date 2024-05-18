const cp = require("child_process");
const { promisify } = require("util");

const exec = promisify(cp.exec);

module.exports = {
  command: ["$"],
  tags: ["owner"],
  help: ["$"],
  run: async (bot, { client, text, command }) => {
    let o;
    try {
      o = await exec(text.trimEnd());
    } catch (e) {
      o = e;
    } finally {
      let { stdout, stderr } = o;
      if (stdout.trim()) client.sendReply(stdout);
      if (stderr.trim()) client.sendReply(stderr);
    }
  },
  owner: true,
  noPrefix: true,
};
