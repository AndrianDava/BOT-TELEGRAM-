const { performance } = require("perf_hooks");
const os = require("os");

module.exports = {
  command: ["ping"],
  tags: ["info"],
  help: ["ping"],
  run: async (bot, { client }) => {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "runtime", callback_data: "runtime" },
            { text: "info", callback_data: "info" },
          ],
        ],
      },
    };

    const old = performance.now();
    const ram = (os.totalmem() / Math.pow(1024, 3)).toFixed(2) + " GB";
    const free_ram = (os.freemem() / Math.pow(1024, 3)).toFixed(2) + " GB";
    const serverInfo = `Server Information

- ${os.cpus().length} CPU: ${os.cpus()[0].model}

- Uptime: ${Math.floor(os.uptime() / 86400)} days
- Ram: ${free_ram}/${ram}
- Speed: ${(performance.now() - old).toFixed(5)} ms`;

    client.sendReply(serverInfo, keyboard);

    bot.on("callback_query", (ctx) => {
      const action = ctx.callbackQuery.data;
      switch (action) {
        case "runtime":
          ctx.editMessageText("....");
          break;
        case "info":
          ctx.editMessageText("....");
          break;
      }
    });
  },
};
