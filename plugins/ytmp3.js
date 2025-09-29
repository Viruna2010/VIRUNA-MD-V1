// ytdl.js
const axios = require('axios');

async function ytdl(url) {
    try {
        // 🌟 Widipe API (no key needed)
        const apiUrl = `https://widipe.com/download/ytmp3?url=${encodeURIComponent(url)}`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.result || !data.result.download_url) {
            throw new Error("Failed to get download link");
        }

        return {
            title: data.result.title || "Unknown Title",
            downloadUrl: data.result.download_url
        };
    } catch (err) {
        console.error("YTDL Error:", err.message);
        return { error: err.message };
    }
}

// Example usage
ytdl("https://youtube.com/watch?v=q763OBiwDKg")
  .then(res => console.log(res))
  .catch(err => console.error(err));

module.exports = ytdl;
