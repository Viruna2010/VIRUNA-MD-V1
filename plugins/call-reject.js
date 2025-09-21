// plugins/call-reject.js

module.exports = {
    name: "call-reject",
    async before(m, { conn }) {
        // Group calls ignore
        if (m.isGroup) return;

        // Call detection (20 = incoming call, 21 = video call)
        if (m.messageStubType === 20 || m.messageStubType === 21) {
            let from = m.key.remoteJid;

            try {
                // Reject the call
                if (conn.rejectCall) {
                    await conn.rejectCall(m.key.id, from);
                }

                // Warn the caller
                await conn.sendMessage(from, {
                    text: "❌ Please do not call this bot! You may get blocked."
                });
                console.log("⚠️ Call rejected from:", from);
            } catch (e) {
                console.error("Call reject error:", e);
            }
        }
    }
};
