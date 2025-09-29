const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

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
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🎵 *YouTube MP3 Download* 🎵\n\n` +
            `*Title:* ${title || "Unknown"}\n` +
            `*Duration:* ${timestamp || "Unknown"}\n` +
            `*Views:* ${views || "Unknown"}\n` +
            `*Release Ago:* ${ago || "Unknown"}\n` +
            `*Author:* ${author?.name || "Unknown"}\n` +
            `*Url:* ${url || "Unknown"}\n\n` +
            `Reply with:\n` +
            `1.1 Audio 🎵\n` +
            `1.2 Document 📁\n\n` +
            `${config.FOOTER || "Viruna MD"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;

        conn.ev.on('messages.upsert', async (messageUpdate) => { 
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const userReply = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReplyToSentMsg) return;

                let type;
                if (userReply.trim() === "1.1") {
                    await conn.sendMessage(from, { text: "⏳ Processing Audio..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    type = { audio: { url: response.result.download.url }, mimetype: "audio/mpeg" };

                } else if (userReply.trim() === "1.2") {
                    await conn.sendMessage(from, { text: "⏳ Processing Document..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    type = { document: { url: response.result.download.url, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title } };

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
