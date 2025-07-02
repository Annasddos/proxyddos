const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeInMemoryStore,
    PHONENUMBER_MCC,
    Browsers,
    makeCacheableMediaMessage,
    WAMessageContent,
    WAMessageKey,
    UserStatus,
    delay,
    is
} = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors'); // Import CORS
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Import konfigurasi global dan modul lainnya
require('./config');
const { konek } = require('./connect');
const { sendBugMessage, updateBugStatus, getBugStatus } = require('./bugs');
const { sendTelegramNotification } = require('./telegram');

// Inisialisasi Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Mengaktifkan CORS untuk semua permintaan

// --- Melayani file statis dari root directory ---
// Ini akan melayani index.html, app.js, styles.css, dan folder assets/
app.use(express.static(path.join(__dirname)));

// Route untuk index.html (jika diakses langsung tanpa nama file)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Logger untuk Baileys
const logger = pino({ level: 'silent' });

// Store untuk menyimpan data pesan Baileys
const store = makeInMemoryStore({ logger });
store.readFromFile(path.join(__dirname, 'baileys_store_v2.json'));
setInterval(() => {
    store.writeToFile(path.join(__dirname, 'baileys_store_v2.json'));
}, 10000);

// Fungsi untuk membaca input dari konsol (untuk pairing code)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

let client; // Deklarasi variabel client di scope yang lebih luas

async function clientstart() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    client = makeWASocket({
        logger,
        printQRInTerminal: false, // Kita akan menggunakan pairing code atau QR manual
        browser: Browsers.macOS('Chrome'), // Menggunakan browser yang lebih umum
        auth: state,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: 'Halo' }; // Fallback jika store tidak tersedia
        }
    });

    store.bind(client.ev);

    // Event listener untuk perubahan koneksi
    client.ev.on('connection.update', (update) => konek({ client, update, clientstart }));

    // Event listener untuk kredensial
    client.ev.on('creds.update', saveCreds);

    // --- Logika Pairing Code ---
    const usePairingCode = true; // Set ke true untuk menggunakan pairing code
    if (usePairingCode && !client.authState.creds.registered) {
        // Menunggu sebentar agar Baileys siap
        await delay(3000);

        // Meminta nomor telepon
        const phoneNumber = await question('Please enter your WhatsApp number (e.g., 62812xxxxxx):\n> ');
        const code = await client.requestPairingCode(phoneNumber.trim());
        console.log(`Your pairing code: ${code}`);

        // Kirim notifikasi ke Telegram bahwa pairing code telah dibuat
        await sendTelegramNotification(`[WA Bot] Pairing code generated: <b>${code}</b> for number <b>${phoneNumber}</b>. Please link your device.`);
    }

    // Event listener untuk pesan masuk
    client.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (let msg of messages) {
                if (!msg.key.fromMe && msg.key.remoteJid === 'status@broadcast') return; // Abaikan status
                if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return; // Abaikan pesan dari Baileys sendiri

                const remoteJid = msg.key.remoteJid;
                const sender = msg.key.participant || remoteJid;
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

                console.log(`[Pesan Masuk] Dari: ${sender}, Pesan: ${text}`);

                // Contoh respons otomatis
                if (text.toLowerCase() === 'ping') {
                    await client.sendMessage(remoteJid, { text: 'Pong!' });
                }

                // Kirim notifikasi ke Telegram untuk setiap pesan masuk
                const telegramMessage = `[WA Bot - Pesan Baru]\nDari: ${sender}\nPesan: ${text}`;
                await sendTelegramNotification(telegramMessage);
            }
        }
    });
}

// --- API Endpoints untuk Frontend ---

// Endpoint untuk status bot
app.get('/api/bot_status', async (req, res) => {
    const botOnlineStatus = client && client.user ? true : false;
    res.json({
        status: true,
        botOnline: botOnlineStatus,
        message: `Bot is currently ${botOnlineStatus ? 'Online' : 'Offline'}.`
    });
});

// Endpoint untuk mengirim pesan bug
app.post('/api/send_bug', async (req, res) => {
    const { recipient, bugType, osType } = req.body;
    if (!recipient || !bugType || !osType) {
        return res.status(400).json({ status: 'error', message: 'Missing recipient, bugType, or osType.' });
    }

    if (!client || !client.user) {
        return res.status(503).json({ status: 'error', message: 'WhatsApp bot is not connected.' });
    }

    const result = await sendBugMessage(client, recipient, bugType, osType);
    res.json(result);
});

// Endpoint untuk memperbarui status bug di backend
app.post('/api/update_bug_status', (req, res) => {
    const { status, os } = req.body;
    if (!status || !os) {
        return res.status(400).json({ status: 'error', message: 'Missing status or os.' });
    }
    const result = updateBugStatus(status, os);
    res.json(result);
});

// Endpoint untuk mendapatkan status bug dari backend
app.get('/api/get_bug_status', (req, res) => {
    const status = getBugStatus();
    res.json({ status: 'success', data: status });
});

// Menjalankan server Express
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    clientstart(); // Memulai bot WhatsApp saat server Express berjalan
});