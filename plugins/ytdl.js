const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch'); // npm install node-fetch

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".play3 <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or YouTube URL!");

        // Get video URL
        let videoUrl = q.startsWith("https://") ? q : null;

        if (!videoUrl) {
            const searchResults = await yts(q);
            if (!searchResults?.videos?.length) return await reply("❌ No results found!");
            videoUrl = searchResults.videos[0].url;
        }

        const videoId = replaceYouTubeID(videoUrl);
        const videoInfo = await yts({ videoId });
        const title = videoInfo?.title || "Unknown";
        const image = videoInfo?.thumbnail || null;
        const duration = videoInfo?.timestamp || "Unknown";

        // Send info message with reply options
        const info = `🎵 *YouTube MP3 Download* 🎵\n\n` +
            `*Title:* ${title}\n` +
            `*Duration:* ${duration}\n` +
            `*Url:* ${videoUrl}\n\n` +
            `Reply with:\n` +
            `1.1 Audio 🎵\n` +
            `1.2 Document 📁\n\n` +
            `${config.FOOTER || "Viruna MD"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;

        // Listen for user reply
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const userReply = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReplyToSentMsg) return;

                // Call LAKIYA API
                const apiUrl = `https://lakiya-api-site.vercel.app/download/ytmp3new?url=${encodeURIComponent(videoUrl)}&type=mp3`;
                const headers = { "User-Agent": "Mozilla/5.0", "Accept": "application/json" };
                const response = await fetch(apiUrl, { headers });
                const data = await response.json();

                if (!data?.url) return await reply("❌ Failed to fetch MP3 from API!");

                let type;
                if (userReply.trim() === "1.1") {
                    await conn.sendMessage(from, { text: "⏳ Processing Audio..." }, { quoted: mek });
                    type = { audio: { url: data.url, mimetype: "audio/mpeg" } };

                } else if (userReply.trim() === "1.2") {
                    await conn.sendMessage(from, { text: "⏳ Processing Document..." }, { quoted: mek });
                    type = { document: { url: data.url, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title } };

                } else {
                    return await reply("❌ Invalid choice! Reply with 1.1 or 1.2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media Upload Successful ✅', edit: mek.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ Error while processing: ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await reply(`❌ Failed: ${error.message || "Unknown Error"}`);
    }
});
