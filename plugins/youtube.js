const yts = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
  command: ["play"],
  help: ["play"],
  tags: ["download"],
  run: async (bot, { client, args }) => {
    if (!args[0]) {
      client.sendReply("Masukan Query!\n\nContoh:\n.play <judul lagu>");
      return;
    }

    try {
      const query = args.join(" ");

      const { videos } = await yts(query);

      if (videos.length === 0) {
        client.sendReply(`Tidak dapat menemukan video untuk query "${query}".`);
        return;
      }

      const video = videos[0];
      const videoTitle = video.title;
      currentVideoTitle = videoTitle;
      const videoId = video.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const infoMessage = `[ YouTube Play ]

🎶 Title: ${videoTitle}      
⏱️ Duration: ${video.duration.timestamp} ⏱️
👁️ Views: ${video.views} person
🧑‍🎤 Uploader: [${video.author.name}]
🔗 URL: ${videoUrl} 
      `;

      client.replyWithPhoto(video.thumbnail, {
        caption: infoMessage,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Unduh Audio 🎵",
                callback_data: `download-audio`,
              },
              {
                text: "Unduh Video 📹",
                callback_data: `download-video`,
              },
            ],
          ],
        },
        reply_to_message_id: client.message.message_id,
      });
      const chatId = client.message.message_id;

      bot.on("callback_query", async (ctx) => {
        const action = ctx.callbackQuery.data;

        try {
          const videoInfo = await ytdl.getInfo(
            `https://www.youtube.com/watch?v=${videoId}`,
          );

          switch (action) {
            case "download-audio":
              await ctx.editMessageCaption(config.client.wait);
              const audioStream = await ytdl(
                `https://www.youtube.com/watch?v=${videoId}`,
                { filter: "audioonly" },
              );

              await client.replyWithAudio(
                { source: audioStream },
                {
                  caption: videoTitle,
                  reply_to_message_id: client.message.message_id,
                  filename: `${videoTitle}.mp3`,
                },
              );
              break;

            case "download-video":
              await ctx.editMessageCaption(config.client.wait);
              const format = ytdl.chooseFormat(videoInfo.formats, {
                quality: "lowest",
              });
              const videoStream = ytdl(
                `https://www.youtube.com/watch?v=${videoId}`,
                {
                  format: format,
                },
              );
              const thumbnailUrl = videoInfo.videoDetails.thumbnails[0].url;

              await client.replyWithVideo(
                { source: videoStream },
                {
                  caption: videoTitle,
                  reply_to_message_id: client.message.message_id,
                  thumb: thumbnailUrl,
                },
              );
              break;

            default:
              break;
          }
        } catch (error) {
          console.error(error);
          client.sendReply(config.client.error);
        }
      });
    } catch (error) {
      console.error(error);
      client.sendReply(config.client.error);
    }
  },
};