module.exports = {
  command: ["groupinfo"],
  help: ["groupinfo"],
  tags: ["info"],
  run: async (bot, { client: ctx }) => {
    const chatId = ctx.chat.id;
    const chatInfo = await ctx.telegram.getChat(chatId);

    const admins = await ctx.telegram.getChatAdministrators(chatId);
    const memberCount = await ctx.telegram.getChatMembersCount(chatId);
    const chatDescription = chatInfo.description || "Tidak ada deskripsi grup.";
    const createdDate = new Date(chatInfo.date * 1000).toLocaleString("en-US", {
      timeZone: "UTC",
    });
    const chatStats = await ctx.telegram.getChatMember(chatId, bot.botInfo.id);
    const isAdmin = admins.some((admin) => admin.user.id === bot.botInfo.id);
    const onlineMembers = await ctx.telegram.getChatMembersCount(chatId, {
      status: "online",
    });
    const chatPhotoUrl = await (
      await ctx.telegram.getFileLink(chatInfo.photo.small_file_id)
    ).href;

    const inlineKeyboard = {
      inline_keyboard: [[{ text: "URL Grup", url: chatInfo.invite_link }]],
    };

    let replyMessage = `
    ℹ️ [CHAT INFO]
    
    🆔 ID: ${chatId}
    📛 Group name: ${chatInfo.title}
    🗳 Group type: ${chatInfo.type === "private" ? "Private" : "Public"}
    🖌 Created: ${createdDate}
    ⚠ Group level: ${
      chatStats.status === "administrator"
        ? chatStats.can_restrict_members
          ? "Superadmin"
          : "Admin"
        : "Member"
    }
    💬 Viewable messages: ${
      chatStats.until_date ? chatStats.until_date : "Unlimited"
    }
    💬 Messages sent: ${
      chatStats.user
        ? chatStats.user.restrictions
          ? chatStats.user.restrictions.view_messages
          : 0
        : 0
    }
    👥 Members: ${memberCount}
    👮 Administrators: ${admins.length}
    🤖 Bots: ${admins.filter((admin) => admin.user.is_bot).length}
    👀 Currently online: ${onlineMembers}
    🔕 Restricted users: ${
      chatStats.user
        ? chatStats.user.restrictions
          ? chatStats.user.restrictions.is_member
          : 0
        : 0
    } 🦸‍♂ Supergroup: ${
      chatInfo.supergroup ? "Yes" : "No"
    } 🗒 Description: ${chatDescription}
    ${isAdmin ? "👑 I am an administrator in this group." : ""}
  `;

    ctx.replyWithPhoto({ url: chatPhotoUrl }, { caption: replyMessage });
  },
  group: true,
};
