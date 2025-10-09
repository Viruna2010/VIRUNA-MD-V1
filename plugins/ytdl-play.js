const { cmd } = require('../command');
const config = require('../config');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// Fix for Heroku SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

cmd({
    pattern: "yt2",
    alias: ["play2", "music"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".yt2 <query or URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a YouTube URL or search query!");

        let videoUrl, title;

        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const info = await ytdl.getInfo(videoUrl);
            title = info.videoDetails.title;
        } else {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        const infoMsg = `🎵 *YouTube MP3 Download* 🎵\n\n` +
                        `*Title:* ${title}\n` +
                        `*Url:* ${videoUrl}\n\n` +
                        `Reply with:\n` +
                        `1.1 Audio 🎵\n` +
                        `1.2 Document 📁\n\n` +
                        `${config.FOOTER || "Viruna MD"}`;

        const sentMsg = await conn.sendMessage(from, { text: infoMsg }, { quoted: mek });
        const messageID = sentMsg.key.id;

        const listener = async (update) => {
            try {
                const mekReply = update?.messages?.[0];
                if (!mekReply?.message) return;

                const replyText = mekReply?.message?.conversation || mekReply?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekReply?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReplyToSentMsg) return;

                if (replyText !== "1.1" && replyText !== "1.2") {
                    await reply("❌ Invalid choice! Reply with 1.1 or 1.2.");
                    return;
                }

                await reply("⏳ Downloading audio...");

                const tempFile = path.join(__dirname, `${Date.now()}.mp3`);
                const audioStream = ytdl(videoUrl, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    requestOptions: {
                        strictSSL: false, // Fix Heroku SSL issue
                        headers: { "User-Agent": "Mozilla/5.0" }
                    }
                });

                const writeStream = fs.createWriteStream(tempFile);
                audioStream.pipe(writeStream);

                writeStream.on('finish', async () => {
                    try {
                        if (replyText === "1.1") {
                            await conn.sendMessage(from, { audio: fs.readFileSync(tempFile), mimetype: 'audio/mpeg', ptt: false }, { quoted: mek });
                        } else {
                            await conn.sendMessage(from, { document: fs.readFileSync(tempFile), fileName: `${title}.mp3`, mimetype: 'audio/mpeg', caption: title }, { quoted: mek });
                        }
                        fs.unlinkSync(tempFile);
                        await reply(`✅ *${title}* downloaded successfully!`);
                    } catch (err) {
                        console.error(err);
                        await reply("❌ Failed to send audio!");
                    }
                });

                audioStream.on('error', async (err) => {
                    console.error(err);
                    await reply("❌ Failed to download audio!");
                });

                // Remove listener after first valid reply
                conn.ev.off('messages.upsert', listener);

            } catch (err) {
                console.error(err);
            }
        };

        conn.ev.on('messages.upsert', listener);

    } catch (err) {
        console.error(err);
        await reply(`❌ Error: ${err.message}`);
    }
});
