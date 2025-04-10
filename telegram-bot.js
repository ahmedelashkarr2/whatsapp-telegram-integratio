// Telegram bot setup
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

// This file will be populated with the actual token once provided by the user
const TOKEN_FILE = path.join(__dirname, 'telegram-token.txt');
let bot = null;

// Function to initialize the bot with the provided token
function initializeBot(token) {
  // Save token to file for future use
  fs.writeFileSync(TOKEN_FILE, token);
  
  // Create new bot instance
  bot = new Telegraf(token);
  
  // Set up bot commands
  bot.command('start', (ctx) => {
    ctx.reply('WhatsApp-Telegram Integration Bot is active! Messages from WhatsApp will be forwarded here.');
  });
  
  bot.command('help', (ctx) => {
    ctx.reply(
      'Commands:\n' +
      '/start - Start the bot\n' +
      '/status - Check connection status\n' +
      '/help - Show this help message'
    );
  });
  
  bot.command('status', (ctx) => {
    ctx.reply('Bot is online and ready to receive WhatsApp messages.');
  });
  
  // Start the bot
  bot.launch()
    .then(() => {
      console.log('Telegram bot started successfully!');
      return bot.telegram.getMe();
    })
    .then((botInfo) => {
      console.log(`Bot info: @${botInfo.username}`);
      
      // Save bot info to file
      fs.writeFileSync(
        path.join(__dirname, 'telegram-bot-info.json'), 
        JSON.stringify(botInfo, null, 2)
      );
    })
    .catch((err) => {
      console.error('Error starting Telegram bot:', err);
    });
    
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  
  return bot;
}

// Function to check if token exists and initialize bot
function setupBot() {
  if (fs.existsSync(TOKEN_FILE)) {
    const token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    return initializeBot(token);
  }
  console.log('No Telegram token found. Please provide a token to initialize the bot.');
  return null;
}

// Function to send message to a specific chat
async function sendMessage(chatId, text, options = {}) {
  if (!bot) {
    console.error('Bot not initialized. Cannot send message.');
    return false;
  }
  
  try {
    await bot.telegram.sendMessage(chatId, text, options);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// Function to send photo to a specific chat
async function sendPhoto(chatId, photo, options = {}) {
  if (!bot) {
    console.error('Bot not initialized. Cannot send photo.');
    return false;
  }
  
  try {
    await bot.telegram.sendPhoto(chatId, photo, options);
    return true;
  } catch (error) {
    console.error('Error sending photo:', error);
    return false;
  }
}

module.exports = {
  initializeBot,
  setupBot,
  sendMessage,
  sendPhoto,
  getBot: () => bot
};
