module.exports.idb = async (msg) => {
  const isNumber = (x) => typeof x === "number" && !isNaN(x);
  const isBoolean = (x) => typeof x === "boolean" && Boolean(x);
  let user = global.db.users[msg.message.from.id];
  if (typeof user !== "object") global.db.users[msg.message.from.id] = {};
  if (user) {
    if (!isNumber(user.limit)) user.limit = 25;
    if (!isBoolean(user.premium)) user.premium = msg.isOwner ? true : false;
    if (!("lastChat" in user)) user.lastChat = new Date() * 1;
    if (!("name" in user)) user.name = msg.pushName;
    if (!isBoolean(user.banned)) user.banned = false;
  } else {
    global.db.users[msg.message.from.id] = {
      limit: 25,
      lastChat: new Date() * 1,
      premium: msg.isOwner ? true : false,
      name: msg.message.from.username,
      banned: false,
    };
  }

  if (msg.isGroup) {
    let chat = global.db.chats[msg.message.chat.id];
    if (typeof chat !== "object") global.db.chats[msg.message.chat.id] = {};
    if (chat) {
      if (!isBoolean(chat.mute)) chat.mute = false;
      if (!isNumber(chat.lastChat)) chat.lastChat = new Date() * 1;
      if (!isBoolean(chat.welcome)) chat.welcome = true;
      if (!isBoolean(chat.leave)) chat.leave = true;

      if (!isBoolean(chat.banned)) chat.banned = false;
      if (!isBoolean(chat.chatAi)) chat.chatAi = false;
    } else {
      global.db.chats[msg.message.chat.id] = {
        lastChat: new Date() * 1,
        mute: false,
        welcome: true,
        leave: true,
        banned: false,
      };
    }
  }

  let setting = global.db.settings;
  if (setting) {
    if (!("model" in setting)) setting.model = "-";
  } else {
    global.db.settings = {
      model: "-",
    };
  }
};
