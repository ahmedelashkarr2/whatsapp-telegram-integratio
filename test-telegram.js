// Test script for Telegram bot
const telegramBot = require('./telegram-bot');

console.log('Telegram bot test script');
console.log('This script will initialize the Telegram bot once you provide a token');
console.log('Please follow the instructions to create a bot with BotFather and provide the token');
console.log('Once the bot is initialized, you can interact with it in Telegram');

// Check if we already have a token file
const fs = require('fs');
const path = require('path');
const TOKEN_FILE = path.join(__dirname, 'telegram-token.txt');

if (fs.existsSync(TOKEN_FILE)) {
  console.log('Found existing token file. Attempting to initialize bot...');
  const bot = telegramBot.setupBot();
  if (bot) {
    console.log('Bot initialized successfully!');
    console.log('You can now interact with the bot in Telegram');
    console.log('Use /start, /help, or /status commands to test the bot');
  }
} else {
  console.log('No token file found. Please create a bot with BotFather and provide the token');
  console.log('Run this script again after saving the token to telegram-token.txt');
}
