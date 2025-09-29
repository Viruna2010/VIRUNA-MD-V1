const axios = require('axios');
const { cmd } = require('../command');
const config = require('../config');

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function getYtmp3(url) {
    try {
        const res = await axios.post('https://api.grabtheclip.com/submit-download', {
            url: url,
            height: 0,
            media_type: 'audio'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });

        const downloadUrl = res.data?.result?.download?.url;
        const title = res.data?.result?.title || 'Unknown';

        if (!downloadUrl) throw new Error('❌ Download link not found!');
        return { downloadUrl, title };
    } catch (err) {
        console.error(err);
        throw new Error(err.message || '❌ Failed to fetch MP3!');
    }
}

cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or YouTube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let url = id ? `https://youtube.com/watch?v=${id}` : null;

        if (!url) return await reply("❌ Invalid YouTube URL!");

        const msgProcessing = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });

        const { downloadUrl, title } = await getYtmp3(url);

        let info = `🍄 *Viruna MD SONG DL* 🍄\n\n` +
            `🎵 *Title:* ${title}\n\n` +
            `🔽 *Reply with your choice:*\n` +
            `1.1 *Audio Type* 🎵\n` +
            `1.2 *Document Type* 📁\n\n` +
            `${config.FOOTER || "𓆩Viruna MD𓆪"}`;

        const sentMsg = await conn.sendMessage(from, { text: info }, { quoted: mek });
        const messageID = sentMsg.key.id;

        // Listen for one-time reply
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let type;

                if (userReply === "1.1") {
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                } else if (userReply === "1.2") {
                    type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                } else {
                    return await reply("❌ Invalid choice! Reply with 1.1 or 1.2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media Upload Successful ✅', edit: msgProcessing.key });
            } catch (err) {
                console.error(err);
                await reply(`❌ Error: ${err.message || "Something went wrong!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
