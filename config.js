require("dotenv").config();

const tokens = ""; //Fill in your Telegram bot token, you can get it via bot father.

module.exports = {
  owner: "rulskeyy",
  namebot: "Elyxsha-BOT",
  thumbnail: "https://cdn.itzpire.site/file/1715939156090-3c153e.jpg",
  tokens,

  APIs: {
    rull: "https://apiruulzz.my.id",
  },

  APIKeys: {
    "https://apiruulzz.my.id": process.env.APIKEY || "",
  },

  msg: {
    error: "Internal Server Eror.",
    owner: "Sorry, this command can only be accessed by the owner!",
    group: "Sorry, this command can only be used within a group!",
    wait: "Your request is being processed...",
  },
};

