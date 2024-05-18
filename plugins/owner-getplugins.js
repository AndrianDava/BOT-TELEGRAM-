const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["getp", "getplugins", "gp"],
  help: ["getplugins"],
  tags: ["owner"],
  run: async (bot, { client, text }) => {
    if (!text) return client.sendReply("Enter the Folder Path and File Name.");
    let filename = /\.js$/i.test(text)
      ? `./${text}`
      : path.join(__dirname, `./plugins/${text}.js`);
    const listCmd = fs
      .readdirSync(path.join(__dirname, "./plugins"))
      .map((v) => v.replace(/\.js/, ""));
    if (!fs.existsSync(filename))
      return m.reply(
        `'${filename}' not found!\n${listCmd
          .map((v) => v)
          .join("\n")
          .trim()}`,
      );
    client.sendReply(fs.readFileSync(filename, "utf8"));
  },
  owner: true,
};
