// public/engine/telegram.js

// Pastikan file config dimuat dan mendefinisikan global.telegram_api_token dan global.telegram_chat_id
require('./config'); 
const axios = require('axios');
const moment = require('moment-timezone'); // Tambahkan momen-timezone untuk timestamp yang konsisten

/**
 * Mengumpulkan informasi dari request HTTP.
 * @param {object} req - Objek request Express.
 * @returns {object} Informasi request.
 */
async function getRequest(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    const url = req.originalUrl;
    const query = JSON.stringify(req.query);
    const headers = JSON.stringify(req.headers, null, 2);
    
    // Menggunakan moment-timezone untuk timestamp yang akurat di Jakarta
    const timestamp = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss [WIB]');
    
    let location = 'Tidak diketahui';
    try {
        // Menggunakan IPAPI (ip-api.com) untuk geo-lokasi
        const res = await axios.get(`http://ip-api.com/json/${ip}`);
        if (res.data.status === 'success') {
            location = `${res.data.city}, ${res.data.regionName}, ${res.data.country}`;
        } else {
            location = `Tidak diketahui (IPAPI status: ${res.data.status})`;
        }
    } catch (error) {
        console.error("Failed to fetch IP location:", error.message);
        location = `Tidak diketahui (Error: ${error.message})`;
    }
    
    return {
        ip,
        userAgent,
        method,
        url,
        query,
        headers,
        location,
        timestamp
    };
}

/**
 * Mengirim pesan ke Telegram menggunakan Bot API.
 * @param {string} message - Pesan yang akan dikirim.
 */
async function sendTele(message) {
    // Pastikan global.telegram_api_token dan global.telegram_chat_id sudah didefinisikan
    if (!global.telegram_api_token || !global.telegram_chat_id) {
        console.error("[Telegram Service] Global Telegram API token or Chat ID is not defined.");
        return;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${global.telegram_api_token}/sendMessage`, {
            chat_id: `${global.telegram_chat_id}`,
            text: "```" + message + "```", // Menggunakan backticks untuk MarkdownV2 code block
            parse_mode: 'MarkdownV2'
        });
        console.log("[Telegram Service] Notification sent to Telegram.");
    } catch (error) {
        console.error("[Telegram Service Error] Failed to send message to Telegram:", 
            error.response ? error.response.data : error.message);
    }
}

// Mengekspor fungsi-fungsi
module.exports = { 
    getRequest, 
    sendTele 
};