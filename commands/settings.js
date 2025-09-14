const config = require('../config');
const { saveConfig } = require('../utils/saveConfig');

module.exports = {
  command: ['settings'],
  category: 'general',
  react: "⚙️",
  desc: "Bot settings වෙනස් කරන්න",
  async start(m, sock) {
    let sections = [
      {
        title: "⚙️ General Settings",
        rows: [
          { title: `👁️ Auto Status Seen`, rowId: "AUTO_STATUS_SEEN", description: `දැන්: ${config.AUTO_STATUS_SEEN}` },
          { title: `💬 Auto Status Reply`, rowId: "AUTO_STATUS_REPLY", description: `දැන්: ${config.AUTO_STATUS_REPLY}` },
          { title: `😍 Auto Status React`, rowId: "AUTO_STATUS_REACT", description: `දැන්: ${config.AUTO_STATUS_REACT}` },
          { title: `🗑️ Anti Delete`, rowId: "ANTI_DELETE", description: `දැන්: ${config.ANTI_DELETE}` },
          { title: `👋 Welcome/Goodbye`, rowId: "WELCOME", description: `දැන්: ${config.WELCOME}` },
          { title: `👑 Admin Events`, rowId: "ADMIN_EVENTS", description: `දැන්: ${config.ADMIN_EVENTS}` },
          { title: `🔗 Anti Link`, rowId: "ANTI_LINK", description: `දැන්: ${config.ANTI_LINK}` },
          { title: `🤖 Mention Reply`, rowId: "MENTION_REPLY", description: `දැන්: ${config.MENTION_REPLY}` },
        ]
      },
      {
        title: "🎭 Extra Features",
        rows: [
          { title: `🤖 Auto React`, rowId: "AUTO_REACT", description: `දැන්: ${config.AUTO_REACT}` },
          { title: `🚫 Anti Bad Words`, rowId: "ANTI_BAD", description: `දැන්: ${config.ANTI_BAD}` },
          { title: `🔒 Mode (public/private)`, rowId: "MODE", description: `දැන්: ${config.MODE}` },
          { title: `🖼️ Auto Sticker`, rowId: "AUTO_STICKER", description: `දැන්: ${config.AUTO_STICKER}` },
          { title: `💬 Auto Reply`, rowId: "AUTO_REPLY", description: `දැන්: ${config.AUTO_REPLY}` },
          { title: `⚡ Always Online`, rowId: "ALWAYS_ONLINE", description: `දැන්: ${config.ALWAYS_ONLINE}` },
          { title: `⌨️ Auto Typing`, rowId: "AUTO_TYPING", description: `දැන්: ${config.AUTO_TYPING}` },
          { title: `🎙️ Auto Recording`, rowId: "AUTO_RECORDING", description: `දැන්: ${config.AUTO_RECORDING}` },
        ]
      }
    ];

    const listMessage = {
      text: `⚙️ *SENU-MD Settings Panel* \n\nඔබට අවශ්‍ය setting එක select කරන්න.`,
      footer: "© Powered by Jester TechX",
      title: "Bot Settings",
      buttonText: "📂 Open Settings",
      sections
    };

    await sock.sendMessage(m.chat, listMessage, { quoted: m });
  }
};
