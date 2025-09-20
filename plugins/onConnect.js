// plugins/onConnect.js
const config = require('../config');

module.exports = (conn) => {
  conn.ev.on('connection.update', async (update) => {
    const { connection } = update;
    if (connection === 'open') {
      const owners = Array.isArray(config.OWNER_NUMBER)
        ? config.OWNER_NUMBER.map(n => n + '@s.whatsapp.net')
        : [config.OWNER_NUMBER + '@s.whatsapp.net'];

      const text = `✅ *${config.BOT_NAME}* Connected!\n🕒 ${new Date().toLocaleString()}`;
      for (let jid of owners) {
        await conn.sendMessage(jid, { text });
      }
    }
  });
};
