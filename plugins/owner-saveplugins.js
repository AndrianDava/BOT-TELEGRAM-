const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["addplugins", "saveplugins", "sp"],
  help: ["saveplugins"],
  tags: ["owner"],
  run: async (bot, { client }) => {
    if (!client.quoted?.text) return client.sendReply("Reply pesan code");
    let dir = text.includes(".js") ? text : `plugins/${text}.js`;
    await fs.writeFileSync(dir, quoted.body);
    client.sendReply(`tersimpan di '${dir}'`);
  },
  owner: true,
  use: "Path Folder command?",
};
