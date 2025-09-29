const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto 
} = require('@whiskeysockets/baileys');
const axios = require('axios');
const https = require('https');

module.exports = {
  name: 'ytdl',
  async execute(conn, message) {
    try {
      const url = message.text.split(' ')[1];
      if (!url) return conn.sendMessage(message.key.remoteJid, { text: 'Please provide a YouTube URL!' });

      // Call external API safely
      const response = await axios.post(
        'https://api.grabtheclip.com/submit-download',
        { url, height: 0, media_type: 'audio' },
        { httpsAgent: new https.Agent({ rejectUnauthorized: false }) } // Heroku TLS fix
      );

      if (!response.data || !response.data.download) {
        return conn.sendMessage(message.key.remoteJid, { text: 'Failed to fetch download link.' });
      }

      const audioUrl = response.data.download[0].url;

      // Prepare WhatsApp audio message
      const media = await prepareWAMessageMedia({ audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { upload: conn.uploadMedia });
      const msg = generateWAMessageFromContent(
        message.key.remoteJid,
        proto.Message.fromObject({ audioMessage: media.audioMessage }),
        { quoted: message }
      );

      await conn.relayMessage(message.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (err) {
      console.error(err);
      conn.sendMessage(message.key.remoteJid, { text: 'Error occurred while downloading audio.' });
    }
  }
};
