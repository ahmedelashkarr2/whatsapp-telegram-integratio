# Deploying WhatsApp-Telegram Integration to Render.com

This guide provides step-by-step instructions for deploying your WhatsApp-Telegram integration to Render.com, allowing it to run online without using your computer.

## Prerequisites

- GitHub account
- Render.com account (free tier)
- Your Telegram bot token
- A computer for initial setup (only needed once)

## Step 1: Prepare Your GitHub Repository

1. Create a new GitHub repository:
   - Go to https://github.com/new
   - Name it "whatsapp-telegram-integration"
   - Set it to Public or Private
   - Click "Create repository"

2. Upload your integration files:
   - Click "uploading an existing file"
   - Upload all the integration files:
     - whatsapp-client.js
     - telegram-bot.js
     - integration_with_contact_names.js (rename to integration.js)
     - app_with_contact_names.js (rename to app.js)
     - package.json (we'll create this in the next step)
   - Click "Commit changes"

3. Create a package.json file with the following content:
```json
{
  "name": "whatsapp-telegram-integration",
  "version": "1.0.0",
  "description": "Integration to forward WhatsApp messages to Telegram",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.19.5",
    "qrcode-terminal": "^0.12.0",
    "telegraf": "^4.12.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

4. Create a .gitignore file:
```
node_modules/
.wwebjs_auth/
.wwebjs_cache/
```

5. Create a start.sh file:
```bash
#!/bin/bash
npm install
node app.js
```

6. Make sure to commit all these files to your repository

## Step 2: Set Up Render.com

1. Create a Render.com account:
   - Go to https://render.com/
   - Sign up with GitHub (recommended for easier deployment)

2. Create a new Web Service:
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the whatsapp-telegram-integration repository

3. Configure the service:
   - Name: whatsapp-telegram-integration
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node app.js`
   - Plan: Free

4. Add Environment Variables:
   - Click "Advanced" and then "Add Environment Variable"
   - Add a variable named TELEGRAM_TOKEN with your bot token as the value

5. Click "Create Web Service"

## Step 3: Modify Your Code for Render.com

Before deploying, we need to make a few modifications to the code to work with Render.com and environment variables.

1. Create a new file called `render.js` in your GitHub repository:

```javascript
// Render.com deployment version of the WhatsApp-Telegram integration
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');

// Configuration
const config = {
  telegramChatId: null
};

// Initialize Telegram bot
const telegramToken = process.env.TELEGRAM_TOKEN;
if (!telegramToken) {
  console.error('TELEGRAM_TOKEN environment variable not set');
  process.exit(1);
}

const bot = new Telegraf(telegramToken);

// Set up bot commands
bot.command('start', (ctx) => {
  ctx.reply('WhatsApp-Telegram Integration Bot is active! Messages from WhatsApp will be forwarded here.');
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Commands:\n' +
    '/start - Start the bot\n' +
    '/status - Check connection status\n' +
    '/setdestination - Set this chat as destination for WhatsApp messages\n' +
    '/help - Show this help message'
  );
});

bot.command('status', (ctx) => {
  ctx.reply('Bot is online and ready to receive WhatsApp messages.');
});

bot.command('setdestination', (ctx) => {
  const chatId = ctx.chat.id;
  config.telegramChatId = chatId;
  ctx.reply(`This chat (ID: ${chatId}) has been set as the destination for WhatsApp messages.`);
  console.log('Telegram destination chat ID set to:', chatId);
});

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// Event handler for QR code generation
client.on('qr', (qr) => {
  console.log('QR Code received. Scan it with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
  
  // Also send QR code to Telegram if we have a chat ID
  if (config.telegramChatId) {
    bot.telegram.sendMessage(
      config.telegramChatId,
      'New WhatsApp QR code generated. Please scan with your WhatsApp app:'
    );
  }
});

// Event handler for client initialization
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  if (config.telegramChatId) {
    bot.telegram.sendMessage(
      config.telegramChatId,
      'WhatsApp client is connected and ready to forward messages!'
    );
  }
});

// Event handler for authentication
client.on('authenticated', () => {
  console.log('WhatsApp authentication successful');
});

// Event handler for authentication failure
client.on('auth_failure', (msg) => {
  console.error('WhatsApp authentication failed:', msg);
  if (config.telegramChatId) {
    bot.telegram.sendMessage(
      config.telegramChatId,
      'WhatsApp authentication failed. Please check the logs.'
    );
  }
});

// Event handler for disconnection
client.on('disconnected', (reason) => {
  console.log('WhatsApp client disconnected:', reason);
  if (config.telegramChatId) {
    bot.telegram.sendMessage(
      config.telegramChatId,
      'WhatsApp client disconnected. A new QR code will be generated for reconnection.'
    );
  }
});

// Event handler for incoming messages
client.on('message', async (message) => {
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
      const contact = await client.getContactById(message.from);
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
    await bot.telegram.sendMessage(config.telegramChatId, formattedMessage, {
      parse_mode: 'Markdown'
    });
    
    // Handle media if present
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      if (media) {
        console.log('Media received, forwarding to Telegram');
        
        // Determine media type and send accordingly
        if (media.mimetype.startsWith('image/')) {
          await bot.telegram.sendPhoto(config.telegramChatId, {
            source: Buffer.from(media.data, 'base64')
          }, {
            caption: `Media from ${senderName}`
          });
        } else {
          // For other media types, send as file
          const fileExtension = media.mimetype.split('/')[1] || 'file';
          await bot.telegram.sendDocument(config.telegramChatId, {
            source: Buffer.from(media.data, 'base64'),
            filename: `media.${fileExtension}`
          }, {
            caption: `Media from ${senderName}`
          });
        }
      }
    }
    
    console.log('Message forwarded successfully');
  } catch (error) {
    console.error('Error forwarding message:', error);
    bot.telegram.sendMessage(
      config.telegramChatId,
      `Error forwarding message: ${error.message}`
    ).catch(console.error);
  }
});

// Start the bot
bot.launch()
  .then(() => {
    console.log('Telegram bot started successfully!');
  })
  .catch((err) => {
    console.error('Error starting Telegram bot:', err);
  });

// Initialize the WhatsApp client
client.initialize();

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});

// Keep the process alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

console.log('WhatsApp-Telegram integration started');
console.log('Send /setdestination to your Telegram bot to set the destination chat');
```

2. Update your package.json to use this file:
```json
{
  "name": "whatsapp-telegram-integration",
  "version": "1.0.0",
  "description": "Integration to forward WhatsApp messages to Telegram",
  "main": "render.js",
  "scripts": {
    "start": "node render.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.19.5",
    "qrcode-terminal": "^0.12.0",
    "telegraf": "^4.12.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

3. Update the start command in Render.com to:
```
node render.js
```

## Step 4: Deploy and Set Up

1. Deploy your application on Render.com:
   - It will automatically deploy when you push changes to GitHub
   - You can also manually deploy from the Render dashboard

2. View the logs to get the QR code:
   - In the Render dashboard, click on your service
   - Go to the "Logs" tab
   - Look for the QR code output
   - Scan it with your WhatsApp mobile app

3. Set up your Telegram destination:
   - Open Telegram and find your bot
   - Send the command `/setdestination`
   - You should receive a confirmation message

4. Test the integration:
   - Send a message to your WhatsApp
   - It should be forwarded to your Telegram chat

## Maintaining the Deployment

1. WhatsApp session expiration:
   - WhatsApp sessions typically last 14-30 days
   - When the session expires, you'll need to scan a new QR code
   - Check the Render logs for the new QR code

2. Monitoring:
   - Regularly check the Render logs for any issues
   - Set up Render alerts for service downtime

3. Updates:
   - To update your code, push changes to your GitHub repository
   - Render will automatically redeploy

## Troubleshooting

1. QR code not displaying properly in logs:
   - Try using the Render web terminal to view it
   - Or modify the code to send the QR code URL to your Telegram

2. WhatsApp connection issues:
   - Check if you're connected to WhatsApp Web elsewhere
   - WhatsApp only allows one web connection at a time

3. Telegram bot not responding:
   - Verify your TELEGRAM_TOKEN environment variable
   - Make sure you've started a chat with your bot

4. Memory issues:
   - Render free tier has limited memory
   - If you experience crashes, consider upgrading to a paid plan
