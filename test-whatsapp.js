// Test script to verify WhatsApp client connection
const whatsappClient = require('./whatsapp-client');

console.log('WhatsApp client test script started');
console.log('Waiting for QR code or authentication...');

// The client is already initialized in the whatsapp-client.js file
// This script just imports it to test the connection

// Add a simple message to confirm the script is running
setTimeout(() => {
  console.log('Still waiting for WhatsApp connection...');
  console.log('Please scan the QR code when it appears');
}, 5000);
