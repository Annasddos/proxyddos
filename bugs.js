// bugs.js

const {
    default: makeWASocket,   
    prepareWAMessageMedia,   
    removeAuthState,  
    useMultiFileAuthState,   
    DisconnectReason,   
    fetchLatestBaileysVersion,   
    makeInMemoryStore,   
    generateWAMessageFromContent,   
    generateWAMessageContent,   
    generateWAMessage,  
    jidDecode,   
    proto,   
    delay,  
    relayWAMessage,   
    getContentType,   
    generateMessageTag,  
    getAggregateVotesInPollMessage,   
    downloadContentFromMessage,   
    fetchLatestWaWebVersion,   
    InteractiveMessage,   
    makeCacheableSignalKeyStore,   
    Browsers,   
    generateForwardMessageContent,   
    MessageRetryMap 
} = require("@whiskeysockets/baileys"); 

const fs = require('fs');  
const path = require('path'); 

// Pastikan path ke ImgCrL.jpg benar relatif terhadap lokasi index.js (root backend Anda)
const ImgCrLPath = path.join(process.cwd(), 'ImgCrL.jpg'); // Ini mencari di root proyek
let ImgCrL;
try {
    ImgCrL = fs.readFileSync(ImgCrLPath);
    console.log(`[Bugs Service] ImgCrL.jpg loaded from: ${ImgCrLPath}`);
} catch (e) {
    console.error(`[Bugs Service Error] Failed to load ImgCrL.jpg from ${ImgCrLPath}. Please ensure the image exists at the backend root. Error:`, e.message);
    ImgCrL = Buffer.from(""); // Fallback to empty buffer
}


/**
 * Sends a simulated "carousels" bug message.
 * @param {object} client - The Baileys WhatsApp client instance.
 * @param {string} targetJid - The JID of the target.
 * @param {string} targetOs - The target OS ('ios' or 'android').
 */
async function carousels2(client, targetJid, targetOs) {
    console.log(`[Bugs Service] Attempting to send carousels (pairing code sim.) to ${targetJid} for OS: ${targetOs}`);

    const messageId = generateMessageTag();

    let mediaContent;
    if (ImgCrL && ImgCrL.length > 0) {
        mediaContent = await prepareWAMessageMedia({ image: ImgCrL }, { upload: client.waUploadToServer });
    } else {
        throw new Error("Carousel image (ImgCrL.jpg) not loaded. Cannot send interactive message with image header.");
    }
    
    const interactiveMessage = {
        body: {
            text: `System Alert: Pairing Request for ${targetOs.toUpperCase()} device.`,
            footerText: "KyuuRzy Bug Panel - Experimental Feature"
        },
        header: {
            hasMediaAttachment: true, // Use hasMediaAttachment for header image
            imageMessage: mediaContent.image,
            caption: "Please verify device pairing"
        },
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Accept Pairing",
                        id: "ACCEPT_PAIRING_123"
                    }),
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Decline",
                        id: "DECLINE_PAIRING_XYZ"
                    }),
                },
            ],
        }),
    };

    const msg = generateWAMessageFromContent(targetJid, {
        interactiveMessage,
        extendedTextMessage: {
            text: "This is a simulated system alert from KepfoЯannaS. Please review the details.",
            contextInfo: {}
        }
    }, { quoted: null, messageId }); 

    await client.relayMessage(targetJid, msg.message, { messageId: msg.key.id });

    console.log(`[Bugs Service] Successfully sent a simulated carousel/interactive message to ${targetJid}.`);
}

/**
 * Sends a simulated "force call" message.
 * @param {object} client - The Baileys WhatsApp client instance.
 * @param {string} targetJid - The JID of the target.
 */
async function forceCall(client, targetJid) {
    console.log(`[Bugs Service] Attempting to send force call to ${targetJid}`);
    
    // Simulate initiating a video call
    const callOffer = await client.relayMessage(targetJid, {
        call: {
            callKey: Buffer.from("".padStart(26, Math.random().toString(36).substring(2, 10))), 
            offer: {
                callId: generateMessageTag(), 
                callType: proto.Message.Call.CallType.VIDEO, 
                isGroup: false, 
            },
        },
    }, { messageId: generateMessageTag() }); 

    console.log(`[Bugs Service] Call initiation message relayed for ${targetJid}.`);
    await delay(1000); 
} 

module.exports = { forceCall, carousels2 };