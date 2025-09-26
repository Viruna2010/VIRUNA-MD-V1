module.exports = (conn) => {
  const ownerNumbers = ['94761138211'];
  conn.ev.on('connection.update', async (update) => {
    const { connection } = update;
    if (connection === 'open') {
      for (let num of ownerNumbers) {
        await conn.sendMessage(num + "@s.whatsapp.net", { text: `✅ Bot connected successfully!` });
      }
    }
  });
}
