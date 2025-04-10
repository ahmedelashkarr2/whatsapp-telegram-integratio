const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Create a directory for storing WhatsApp session data
const SESSION_DIR = path.join(__dirname, 'whatsapp-session');
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// Initialize WhatsApp client with local authentication
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Event handler for QR code generation
client.on('qr', (qr) => {
    console.log('QR Code received. Scan it with your WhatsApp app:');
    qrcode.generate(qr, { small: true });
    
    // Also save QR code to a file for easier access
    fs.writeFileSync(path.join(__dirname, 'qrcode.txt'), qr);
});

// Event handler for client initialization
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Event handler for authentication
client.on('authenticated', () => {
    console.log('WhatsApp authentication successful');
});

// Event handler for authentication failure
client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
});

// Event handler for disconnection
client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
});

// Event handler for incoming messages
client.on('message', async (message) => {
    console.log('New message received:', message.body);
    
    // We'll implement message forwarding to Telegram here in the next step
    // For now, just log the message details
    const messageInfo = {
        from: message.from,
        body: message.body,
        hasMedia: message.hasMedia,
        timestamp: message.timestamp
    };
    
    console.log('Message details:', JSON.stringify(messageInfo, null, 2));
    
    // Save message to a file for debugging
    const messagesLog = path.join(__dirname, 'messages.log');
    fs.appendFileSync(messagesLog, JSON.stringify(messageInfo) + '\n');
});

// Initialize the WhatsApp client
client.initialize();

module.exports = client;
