const axios = require('axios');

async function sendTelegramNotification(message) {
    const token = global.telegram_api_token;
    const chatId = global.telegram_chat_id;

    if (!token || !chatId || token === "7771429262:AAHwRR2VVM0Wlh1LWsmk9V3ZRifx8RZUU9" || chatId === "6878949999") {
        console.warn("Telegram API token or chat ID not configured. Skipping Telegram notification.");
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML' // Bisa diubah ke Markdown atau tanpa parse_mode
        });
        console.log("Telegram notification sent successfully.");
    } catch (error) {
        console.error("Error sending Telegram notification:", error.response ? error.response.data : error.message);
    }
}

module.exports = {
    sendTelegramNotification
};