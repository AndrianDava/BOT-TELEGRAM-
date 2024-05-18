process.on("uncaughtException", console.error);

const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const syntaxerror = require("syntax-error");
const { format } = require("util");
const chokidar = require("chokidar");

const config = require("./config");
const database = new (require("./lib/schema"))();
const { Collection, watchPlugins } = require("./lib/plugins.js");
const tele = require('./lib/opening')
if (config.tokens == '') {
	return console.log(chalk.cyanBright('Authorization:'), chalk.redBright('Tokens Invalid!'))
}


const bot = new Telegraf(config.tokens);

global.axios = require("axios");
global.cheerio = require("cheerio");
global.fetch = require("node-fetch");
global.config = config;
global.API = (name, path = "/", query = {}, apikeyqueryname) =>
  (name in config.APIs ? config.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? "?" +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? {
                [apikeyqueryname]:
                  config.APIKeys[
                    name in config.APIs ? config.APIs[name] : name
                  ],
              }
            : {}),
        }),
      )
    : "");
global.func = new (require("./lib/myfunc"))();
global.plugins = new Collection();

const pluginsFolder = "plugins";
const dir = fs.readdirSync(pluginsFolder)
for (const pluginFolder of dir) {
  const pluginPath = `${pluginsFolder}`;

  if (fs.statSync(pluginPath).isDirectory()) {
    const files = fs
      .readdirSync(pluginPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      try {
        const fullPath = `${pluginsFolder}/${file}`;
        const module = require(`./${fullPath}`);
        if (!module.tags) return;
        plugins.set(fullPath, module);
        console.log(`Plugins loaded: ${fullPath}`);
      } catch (e) {
        console.error(`Error loading plugin: ${e.message}`);
      }
    }
  }
}

database.connect().catch(() => database.connect());
setInterval(async () => {
  fs.writeFileSync(
    `tmp/database.json`,
    JSON.stringify(global.db, null, 3),
  );
}, 3 * 1000);

//group opening remarks

bot.on('new_chat_members', async (client) => {
	var message = client.message
	var groupname = message.chat.title
	var groupmembers = await bot.telegram.getChatMembersCount(message.chat.id)
	for (x of message.new_chat_members) {
		var pp_user = await tele.getPhotoProfile(x.id)
		var full_name = tele.getUser(x).full_name
		console.log(chalk.whiteBright('├'), chalk.cyanBright('[  JOINS  ]'), chalk.whiteBright(full_name), chalk.greenBright('join in'), chalk.whiteBright(groupname))
		await client.replyWithPhoto(pp_user, {
      caption: `Welcome in the group ${groupname} @${full_name}, Please obey the rules in this group`,
      parse_mode: "Markdown",
      })
	}
})

bot.on('left_chat_member', async (client) => {
	var message = client.message
	var pp_user = await tele.getPhotoProfile(message.left_chat_member.id)
	var groupname = message.chat.title
	var groupmembers = await bot.telegram.getChatMembersCount(message.chat.id)
	var pp_user = await tele.getPhotoProfile(message.left_chat_member.id)
	var full_name = tele.getUser(message.left_chat_member).full_name
	console.log(chalk.whiteBright('├'), chalk.cyanBright('[  LEAVE  ]'), chalk.whiteBright(full_name), chalk.greenBright('leave from'), chalk.whiteBright(groupname))
	await client.replyWithPhoto(pp_user, {
      caption: `Goodbye @${full_name}, we hope you are at peace there okay :)\n\n Remaining members: ${groupmembers}`,
      parse_mode: "Markdown",
      })
})


bot.command("start", (client) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.button.url("Visit our website", "https://rulzz.my.id"),
    Markup.button.callback("Say Hello", "HELLO"),
  ]);

  client.reply(`Welcome ${client.from.first_name}!`, { reply_markup: keyboard });
});

bot.on("message", (client) => {
  const body = client.message.text || client.message.caption || "";
  const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_|~!?@#%^&.©^]/gi.test(body)
    ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_|~!?@#%^&.©^]/gi)[0]
    : "";
  const cmd =
    body && body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
  const plugin =
    plugins.get(cmd) ||
    plugins.find((v) => v.command && v.command.includes(cmd));

  const args =
    body
      .trim()
      .replace(new RegExp(prefix, "i"), "")
      .replace(cmd, "")
      .split(/ +/)
      .filter((a) => a) || [];
  const text = args.join(" ");
  const isOwner = config.owner.includes(client.message.from.username);
  const isGroup = client.message.chat.type.includes("group");

  client.args = args;
  client.text = text;
  client.sender = client.message.from.id;
  client.isOwner = isOwner;
  client.isGroup = isGroup;
  client.chat = client.message.chat.id;
  client.quoted = client.message.reply_to_message
    ? client.message.reply_to_message
    : client.message;
  client.sendReply = (teks, options = {}) => {
    return client.reply(teks, {
      reply_to_message_id: client.message.message_id,
      ...options,
    });
  };
  client.editMessage = (id, teks, mess) => {
    return bot.telegram.editMessageText(id, mess.message_id, null, teks);
  };
  client.download = async (quoted) => {
    const id = await func.getFileId(quoted);
    const { href } = await bot.telegram.getFileLink(id);
    return href;
  };

  if (body) {
    require("./lib/database").idb(client);
  }

  if (plugin) {
    if (!prefix && plugin.noPrefix) {
      if (plugin.owner && !isOwner) {
        return client.sendReply(config.msg.owner);
      }
      if (plugin.group && !isGroup) {
        return client.sendReply(config.msg.group);
      }
      if (plugin.use && !text) {
        return client.sendReply(
          plugin.use
            .replace(/%prefix/gi, prefix)
            .replace(/%command/gi, cmd)
            .replace(/%text/gi, text),
        );
      }

      plugin.run(bot, {
        client,
        args,
        text,
        command: cmd,
      });
    }
    if (!!prefix && body.startsWith(prefix)) {
      if (plugin.owner && !isOwner) {
        return client.reply(config.msg.owner);
      }
      if (plugin.group && !isGroup) {
        return client.reply(config.msg.group);
      }
      if (plugin.use && !text) {
        return client.sendReply(
          plugin.use
            .replace(/%prefix/gi, prefix)
            .replace(/%command/gi, cmd)
            .replace(/%text/gi, text),
        );
      }

      plugin.run(bot, {
        client,
        args,
        text,
        command: cmd,
      });
      console.log(chalk.cyanBright("[ Command ]"), chalk.whiteBright(cmd), chalk.greenBright('From'), chalk.whiteBright(`${client.from.first_name}`));
    }
  }

  if (!plugin) {
    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));
    if (files.length === 0) return;
    for (const file of files) {
      const load = require(`./plugins/${file}`);
      load(bot, {
        client,
        args,
        text,
        command: cmd,
      });
    }
  }
});



bot.telegram.getMe().then((client) => {
        console.table({
            "Bot Name": client.first_name,
            "Username": "@" + client.username,
            "ID": client.id,
            "Link": `https://t.me/${client.username}`,
            "Author": "https://t.me/rullskeyy"
        })
    })

bot.launch();

watchPlugins(pluginsFolder);
