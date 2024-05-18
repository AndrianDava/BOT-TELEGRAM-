module.exports = {
  command: ["tiktok"],
  tags: ["download"],
  help: ["tiktok"],
  use: "[!] Input Url TikTok\n\nExample: %prefix%command <url>",
  run: async (bot, { msg }) => {
    try {
      const res = await func.fetchJson(
        "https://api.tiklydown.link/api/download?url=" + msg.args[0],
      );
      var { likeCount, commentCount, shareCount, playCount, saveCount } =
        res.stats;
      const { noWatermark, duration, ratio, watermark } = res.video;
      const { play_url } = res.music;
      const caption = `乂  *TIKTOK DOWNLOADER*\n\n\n◦ *Deskripsi:* *${res.title}*\n◦ *Durasi:* ${duration}\n◦ *Ratio:* ${ratio}\n◦ *Total Share:* ${shareCount}\n◦ *Total Like:* ${likeCount}\n◦ *Total Play:* ${playCount}\n◦ *Total Komentar:* ${commentCount}`;
      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Download Audio", callback_data: "tiktok_audio" }],
          ],
        },
      }; 

      const response = await axios.get(noWatermark, { responseType: 'arraybuffer' });
      const bufferVideo = Buffer.from(response.data);
      
      await msg.replyWithVideo({ source: bufferVideo }, {
        caption: caption,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message.message_id,
        ...replyMarkup,
      });

      bot.on("callback_query", async (ctx) => {	
        const action = ctx.callbackQuery.data;
        
        switch (action) {
          case "tiktok_audio":
            await ctx.editMessageCaption(caption);
            await msg.replyWithVideo(play_url, {
              caption: "TikTok Audio Downloader",
              reply_to_message_id: msg.message.message_id,
            });
            break;
          default:
        }
      });
    } catch (e) {
      console.error(e);
    }
  },
};
