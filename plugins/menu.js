const fs = require("fs");
const os = require("os");
const tags = {
  /*ai: "AI FEATURE",
  download: "DOWNLOAD FEATURE",
  owner: "OWNER FEATURE",
  info: "INFO FEATURE",*/
  main: "Main Feature",
  download: "Download Feature",
  info: "Info Feature",
  owner: "Owner Feature",
};

module.exports = {
  command: ["menu"],
  help: ["menu"],
  tags: ["main"],
  run: async (bot, { client }) => {
    const Start = new Date();

    const now = new Date();
    const uptimeMilliseconds = now - Start;
    const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    let menuText = `Hi ${client.from.username},
I am an automated system (Tele Bot), I can help to become your personal assistant, the features available are: downloading, image generation, AI, etc.

This wabot was created by rulzz

• Runtime Bot: ${uptimeHours} hours ${uptimeMinutes % 60} minutes ${uptimeSeconds % 60} seconds
• Library: Telegraf

Bot Name: ${config.namebot}
\n`;

    const help = Array.from(plugins.values()).map((plugin) => {
      return {
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      };
    });

    for (let plugin of help)
      if (plugin && "tags" in plugin)
        for (let tag of plugin.tags) if (!(tag in tags) && tag) tags[tag] = tag;
    Object.keys(tags).map((tag) => {
      menuText += `┌ • ${tags[tag]}\n`;
      help
        .filter((menu) => menu.tags && menu.tags.includes(tag) && menu.help)
        .map((menu) => {
          menu.help.map((help) => {
            menuText += `│ • .${help ? help : ""}\n`;
          });
        });
      menuText += "╰───────···\n\n";
    });

    /*await client.sendReply(menuText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Source Feature", url: "https://apiruulzz.my.id" }],
        ],
      },
    });*/
    await client.replyWithPhoto(config.thumbnail, {
      caption: menuText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Original Script", url: "https://github.com/khrlmstfa/elyxsha-bot" }],
        ],
      },
    });
  },
};

function getDayName(dayIndex) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex];
}
