// Integration script to connect WhatsApp and Telegram with contact name support
const whatsappClient = require('./whatsapp-client');
const telegramBot = require('./telegram-bot');
const fs = require('fs');
const path = require('path');

// Configuration file to store chat ID
const CONFIG_FILE = path.join(__dirname, 'config.json');
let config = {
  telegramChatId: null
};

// Load configuration if exists
if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log('Configuration loaded:', config);
  } catch (error) {
    console.error('Error loading configuration:', error);
  }
}

// Save configuration
function saveConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log('Configuration saved');
}

// Set Telegram chat ID
function setTelegramChatId(chatId) {
  config.telegramChatId = chatId;
  saveConfig();
  console.log('Telegram chat ID set to:', chatId);
}

// Initialize Telegram bot with commands to set chat ID
function initializeTelegramBot(token) {
  const bot = telegramBot.initializeBot(token);
  
  // Add command to set current chat as destination
  bot.command('setdestination', (ctx) => {
    const chatId = ctx.chat.id;
    setTelegramChatId(chatId);
    ctx.reply(`This chat (ID: ${chatId}) has been set as the destination for WhatsApp messages.`);
  });
  
  return bot;
}

// Connect WhatsApp message events to Telegram forwarding
function connectWhatsAppToTelegram() {
  // Listen for WhatsApp messages
  whatsappClient.on('message', async (message) => {
    if (!config.telegramChatId) {
      console.log('Telegram chat ID not set. Message not forwarded.');
      return;
    }
    
    try {
      console.log('Forwarding message from WhatsApp to Telegram');
      
      // Get contact information if available
      const sender = message.from.split('@')[0]; // Remove the @c.us part
      let senderName = `+${sender}`;
      
      try {
        const contact = await whatsappClient.getContactById(message.from);
        if (contact && contact.name) {
          senderName = contact.name;
        } else if (contact && contact.pushname) {
          senderName = contact.pushname;
        }
      } catch (contactError) {
        console.log('Could not get contact info:', contactError);
      }
      
      // Format the message with sender information
      const formattedMessage = `*WhatsApp Message*\n👤 From: ${senderName}\n\n${message.body}`;
      
      // Send text message
      await telegramBot.sendMessage(config.telegramChatId, formattedMessage, {
        parse_mode: 'Markdown'
      });
      
      // Handle media if present
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        if (media) {
          console.log('Media received, forwarding to Telegram');
          
          // Determine media type and send accordingly
          if (media.mimetype.startsWith('image/')) {
            await telegramBot.sendPhoto(config.telegramChatId, {
              source: Buffer.from(media.data, 'base64')
            }, {
              caption: `Media from ${senderName}`
            });
          } else {
            // For other media types, send as file (to be implemented)
            console.log('Non-image media received, type:', media.mimetype);
          }
        }
      }
      
      console.log('Message forwarded successfully');
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  });
  
  console.log('WhatsApp to Telegram forwarding enabled with contact name support');
}

// Main function to start the integration
function startIntegration(telegramToken) {
  console.log('Starting WhatsApp-Telegram integration');
  
  // Initialize Telegram bot if token provided
  if (telegramToken) {
    initializeTelegramBot(telegramToken);
  } else {
    // Try to use existing token
    telegramBot.setupBot();
  }
  
  // Connect WhatsApp messages to Telegram
  connectWhatsAppToTelegram();
  
  console.log('Integration started');
  console.log('WhatsApp client status: Initialized');
  console.log('Telegram bot status:', telegramBot.getBot() ? 'Initialized' : 'Not initialized');
  
  if (config.telegramChatId) {
    console.log('Telegram destination chat ID:', config.telegramChatId);
  } else {
    console.log('Telegram destination chat not set. Use /setdestination in your Telegram bot chat.');
  }
}

module.exports = {
  startIntegration,
  setTelegramChatId
};

// If this file is run directly, start the integration
if (require.main === module) {
  // Check for token as command line argument
  const token = process.argv[2];
  startIntegration(token);
}
