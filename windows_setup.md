# WhatsApp to Telegram Integration - Windows Setup Guide

This guide provides specific instructions for setting up the WhatsApp to Telegram integration on a Windows system.

## Prerequisites

- Windows 10 or 11
- Administrator access to your computer
- Your smartphone with WhatsApp installed
- A Telegram account

## Installation Steps

### 1. Install Node.js

1. Download Node.js from the official website: https://nodejs.org/
2. Run the installer and follow the installation wizard
3. Make sure to check the option to install npm during installation
4. Verify installation by opening Command Prompt and typing:
   ```
   node --version
   npm --version
   ```

### 2. Set Up Project Folder

1. Create a folder for the project (e.g., C:\WhatsApp-Telegram)
2. Download or copy all the integration files into this folder:
   - whatsapp-client.js
   - telegram-bot.js
   - integration.js
   - app.js
   - Any other project files

### 3. Install Dependencies

1. Open Command Prompt as administrator
2. Navigate to your project folder:
   ```
   cd C:\WhatsApp-Telegram
   ```
3. Install required packages:
   ```
   npm install whatsapp-web.js qrcode-terminal telegraf
   ```

### 4. Configure Telegram Bot

1. Create a file named `telegram-token.txt` in your project folder
2. Add your Telegram bot token to this file (the one you received from BotFather)
3. Save the file

### 5. Run the Integration

1. In Command Prompt, navigate to your project folder:
   ```
   cd C:\WhatsApp-Telegram
   ```
2. Start the application:
   ```
   node app.js
   ```
3. A QR code will appear in the terminal

### 6. Connect WhatsApp

1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Tap on "Link a Device"
4. Scan the QR code displayed in the Command Prompt

### 7. Configure Telegram Destination

1. Open Telegram and find your bot
2. Start a chat with your bot
3. Send the command `/setdestination`
4. You should receive a confirmation message

## Running as a Background Service

To keep the integration running even when you close the Command Prompt:

### Option 1: Using PM2

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```
2. Start your application with PM2:
   ```
   pm2 start app.js --name "whatsapp-telegram"
   ```
3. Set PM2 to start on boot:
   ```
   pm2 startup
   ```
   (Follow the instructions provided by this command)
4. Save the current process list:
   ```
   pm2 save
   ```

### Option 2: Using Windows Task Scheduler

1. Open Task Scheduler (search for it in the Start menu)
2. Click "Create Basic Task"
3. Name it "WhatsApp-Telegram Integration"
4. Select "When the computer starts" as the trigger
5. Select "Start a program" as the action
6. Browse to the Node.js executable (typically C:\Program Files\nodejs\node.exe)
7. Add the full path to your app.js file as an argument
8. Check "Open the Properties dialog" before finishing
9. In the Properties dialog, check "Run with highest privileges"
10. Click OK to save

## Troubleshooting

- **QR Code Not Displaying**: Make sure your terminal supports ASCII art or try using Windows Terminal instead of Command Prompt
- **WhatsApp Disconnects**: You may need to restart the application and scan the QR code again
- **Node.js Errors**: Make sure you have installed all dependencies correctly
- **Windows Firewall**: You might need to allow Node.js through your firewall

## Maintenance

- The WhatsApp connection may require rescanning the QR code every 14-30 days
- To update the application, stop it, replace the files, and restart it
- Check for updates to the dependencies periodically:
  ```
  npm update
  ```

## Security Notes

- Keep your Telegram bot token secure
- Be aware that anyone with access to your WhatsApp QR code can connect to your WhatsApp account
- Consider setting up a dedicated WhatsApp account for this integration if handling sensitive messages
