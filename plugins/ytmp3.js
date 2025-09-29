import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Enter The YouTube URL please");
    await m.reply("_Wait....._");
    try {
        let z = await ytdl(text);
        if (z.error) throw new Error(z.error);

        await conn.sendMessage(
            m.chat,
            { audio: { url: z.videoUrl }, mimetype: "audio/mpeg" },
            { quoted: m }
        );
    } catch (e) {
        console.log(e);
        m.reply(`_Error Detected, Check this message Below_\n\n${e}`);
    }
};

handler.help = handler.command = ['ytmp3'];
handler.tags = ['downloader'];
handler.limit = true;
handler.register = false;

export default handler;

async function ytdl(url) {
    try {
        const apiUrl = `https://api.arabdullah.top/api/ytmp3?url=${encodeURIComponent(url)}&apiKey=AIzaSyB16u905w4V702Xvq81i0b2J9iX43mR85c`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data || !data.result || !data.result.download_url) {
            throw new Error("Failed to get download link");
        }

        return {
            videoUrl: data.result.download_url,
            title: data.result.title || "Unknown Title"
        };
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
}
