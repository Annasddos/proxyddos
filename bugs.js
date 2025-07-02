const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { sendTelegramNotification } = require('./telegram'); // Impor fungsi notifikasi Telegram

// Fungsi untuk mendapatkan gambar ImgCrL.jpg
function getImgCrLLocalPath() {
    return path.join(__dirname, 'ImgCrL.jpg');
}

// Fungsi untuk mengirim pesan bug ke WhatsApp
async function sendBugMessage(client, recipient, bugType, osType) {
    let message = `*BUG REPORT*\n\n`;
    message += `Type: ${bugType}\n`;
    message += `OS: ${osType}\n`;
    message += `Time: ${new Date().toLocaleString('id-ID')}\n\n`;
    message += `_This is an automated bug report from KepfoЯannaS's system._`;

    try {
        // Cek apakah file ImgCrL.jpg ada
        const imagePath = getImgCrLLocalPath();
        if (fs.existsSync(imagePath)) {
            await client.sendMessage(recipient, {
                image: { url: imagePath },
                caption: message
            });
            console.log(`Bug message with image sent to ${recipient}`);
        } else {
            // Jika gambar tidak ada, kirim pesan teks saja
            await client.sendMessage(recipient, { text: message });
            console.log(`Bug message (text only, image not found) sent to ${recipient}`);
        }

        // Kirim notifikasi ke Telegram
        const telegramMessage = `[BUG REPORT - WA Bot]\nType: ${bugType}\nOS: ${osType}\nRecipient: ${recipient}\nTime: ${new Date().toLocaleString('id-ID')}`;
        await sendTelegramNotification(telegramMessage);

        return { status: 'success', message: 'Bug message sent successfully.' };
    } catch (error) {
        console.error("Error sending bug message:", error);
        return { status: 'error', message: 'Failed to send bug message.' };
    }
}

// Fungsi untuk memperbarui status bug
function updateBugStatus(status, os) {
    global.bug_status = status;
    global.bug_os = os;
    global.bug_last_checked = new Date().toISOString();
    console.log(`Bug status updated: ${status} on ${os}`);
    return { status: 'success', message: 'Bug status updated.' };
}

// Fungsi untuk mendapatkan status bug
function getBugStatus() {
    return {
        status: global.bug_status,
        os: global.bug_os,
        lastChecked: global.bug_last_checked
    };
}

module.exports = {
    sendBugMessage,
    updateBugStatus,
    getBugStatus
};