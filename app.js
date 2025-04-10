// Main application file to run the WhatsApp-Telegram integration
const integration = require('./integration');

console.log('Starting WhatsApp-Telegram Integration Service');

// Read token from file if not provided as argument
const fs = require('fs');
const path = require('path');
const TOKEN_FILE = path.join(__dirname, 'telegram-token.txt');

let token = null;
if (fs.existsSync(TOKEN_FILE)) {
  token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  console.log('Telegram token loaded from file');
} else {
  console.error('No Telegram token found. Please create telegram-token.txt with your bot token');
  process.exit(1);
}

// Start the integration with the token
integration.startIntegration(token);

console.log('Integration service started');
console.log('To set your Telegram chat as the destination for WhatsApp messages:');
console.log('1. Open your Telegram app');
console.log('2. Start a chat with your bot');
console.log('3. Send the command /setdestination');
console.log('4. You should receive a confirmation message');

console.log('\nThe service is now running. WhatsApp messages will be forwarded to your Telegram chat.');
console.log('Press Ctrl+C to stop the service.');
