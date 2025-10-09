const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');
const https = require('https');

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
        
        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoInfo = await yts({ videoId: q.split(/[=/]/).pop() });
            title = videoInfo?.title || "Unknown";
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Downloading audio...");

        // Call a reliable API (SSL bypass if necessary)
        const apiUrl = `https://lakiya-api-site.vercel.app/download/ytmp3new?url=${encodeURIComponent(videoUrl)}&type=mp3`;
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await fetch(apiUrl, { agent });
        const data = await response.json();

        if (!data?.url) return await reply("❌ Failed to download audio!");

        await conn.sendMessage(from, {
            audio: { url: data.url, mimetype: 'audio/mpeg' },
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
