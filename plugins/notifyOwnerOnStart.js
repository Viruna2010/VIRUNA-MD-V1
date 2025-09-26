module.exports = (conn) => {
    const ownerNumber = ['94761138211'] // Owner number

    conn.ev.on('connection.update', async (update) => {
        const { connection } = update

        if (connection === 'open') {
            for (let num of ownerNumber) {
                await conn.sendMessage(num + "@s.whatsapp.net", {
                    text: `✅ Bot connected successfully! Hello Owner ( ${num} ), your Viruna-MD bot is now online 🚀`
                })
            }
        }
    })
}
