const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch'); // npm install node-fetch

cmd({
    pattern: "yt2",
    alias: ["play2", "music"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".song <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;

        // Check if input is a YouTube URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoId = q.split(/v=|\/|=/).pop();
            const videoInfo = await yts({ videoId });
            title = videoInfo?.title || "Unknown Title";
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Downloading audio...");

        // Use LAKIYA API
        const apiUrl = `https://lakiya-api-site.vercel.app/download/ytmp3new?url=${encodeURIComponent(videoUrl)}&type=mp3`;
        const headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        };

        const response = await fetch(apiUrl, { headers });
        const data = await response.json();

        if (!data || !data.url) {
            return await reply("❌ Failed to get MP3 from API!");
        }

        // Send audio to WhatsApp
        await conn.sendMessage(from, {
            audio: { url: data.url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
