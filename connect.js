const { DisconnectReason, useMultiFileAuthState, makeInMemoryStore } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const logger = pino({ level: 'silent' }); // Menggunakan silent agar tidak terlalu banyak log di konsol

const store = makeInMemoryStore({ logger });
store.readFromFile(path.join(__dirname, 'baileys_store_v2.json'));
setInterval(() => {
    store.writeToFile(path.join(__dirname, 'baileys_store_v2.json'));
}, 10000);

exports.konek = async ({ client, update, clientstart }) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

        if (reason === DisconnectReason.badSession) {
            console.log(`Bad Session File, Please Delete Session and Scan Again`);
            // Mungkin tambahkan logika untuk menghapus folder session di sini
            // fs.rmSync('./session', { recursive: true, force: true });
            // process.exit(1); // Keluar dari proses
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log("Connection closed, reconnecting....");
            clientstart();
        } else if (reason === DisconnectReason.connectionLost) {
            console.log("Connection Lost from Server, reconnecting....");
            clientstart();
        } else if (reason === DisconnectReason.connectionReplaced) {
            console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
            // fs.rmSync('./session', { recursive: true, force: true });
            // process.exit(1);
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
            // fs.rmSync('./session', { recursive: true, force: true });
            // process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
            console.log("Restart Required, Restarting...");
            clientstart();
        } else if (reason === DisconnectReason.timedOut) {
            console.log("Connection TimedOut, Reconnecting...");
            clientstart();
        } else {
            console.log(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
            clientstart(); // Coba reconnect untuk alasan tidak dikenal
        }
    } else if (connection === "open") {
        console.log(`
██████╗ ██╗   ██╗███████╗██╗     ██╗███╗   ██╗██████╗  ██████╗ ██╗  ██╗
██╔══██╗██║   ██║██╔════╝██║     ██║████╗  ██║██╔══██╗██╔═══██╗██║ ██╔╝
██████╔╝██║   ██║█████╗  ██║     ██║██╔██╗ ██║██████╔╝██║   ██║█████╔╝
██╔══██╗██║   ██║██╔══╝  ██║     ██║██║╚██╗██║██╔══██╗██║   ██║██╔═██╗
██████╔╝╚██████╔╝███████╗███████╗██║██║ ╚████║██████╔╝╚██████╔╝██║  ██╗
╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝
                                                               By KepfoЯannaS
`);
        console.log("Bot is Online and Connected!");
    }
};