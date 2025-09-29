async function ytdl(url) {
    try {
        const apiUrl = `https://api.arabdullah.top/api/ytmp3?url=${encodeURIComponent(url)}&apiKey=AIzaSyB16u905w4V702Xvq81i0b2J9iX43mR85c`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Debugging log (to see full API response)
        console.log("YT API Response:", data);

        const dl = data?.result?.download_url || data?.result?.downloadUrl || data?.result?.url;
        if (!dl) throw new Error("Failed to get download link");

        return {
            videoUrl: dl,
            title: data?.result?.title || "Unknown Title"
        };
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
}
