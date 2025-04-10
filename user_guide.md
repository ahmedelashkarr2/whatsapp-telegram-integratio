# WhatsApp to Telegram Integration - User Guide

## Overview

This integration allows you to automatically forward messages from WhatsApp to Telegram. When someone sends a message to your WhatsApp account, it will be automatically forwarded to your designated Telegram chat.

## Features

- Forward text messages from WhatsApp to Telegram
- Forward media (images) from WhatsApp to Telegram
- Maintain sender information in forwarded messages
- Simple setup with QR code authentication for WhatsApp
- No need for WhatsApp Business API or verification

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- WhatsApp account
- Telegram account

### Step 1: Install the Integration

1. Download the integration files to your computer or server
2. Install dependencies:
   ```
   cd whatsapp-telegram-integration
   npm install
   ```

### Step 2: Configure Telegram Bot

1. Create a Telegram bot using BotFather:
   - Open Telegram and search for @BotFather
   - Send the command `/newbot`
   - Follow the instructions to create your bot
   - Save the API token provided by BotFather

2. Save your Telegram bot token:
   - Create a file named `telegram-token.txt` in the integration directory
   - Paste your bot token into this file

### Step 3: Start the Integration

1. Run the application:
   ```
   node app.js
   ```

2. Connect WhatsApp:
   - A QR code will be displayed in the terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices
   - Tap on "Link a Device"
   - Scan the QR code displayed in the terminal

3. Configure Telegram destination:
   - Open Telegram and find your bot
   - Start a chat with your bot
   - Send the command `/setdestination`
   - You should receive a confirmation message

### Step 4: Test the Integration

1. Ask someone to send a message to your WhatsApp
2. The message should automatically appear in your Telegram chat with your bot
3. Both text messages and images should be forwarded

## Usage

Once set up, the integration works automatically:

- All incoming WhatsApp messages will be forwarded to your Telegram chat
- Messages will include information about the sender
- Media files (currently images) will be forwarded as well

## Commands

Your Telegram bot supports the following commands:

- `/start` - Start the bot
- `/help` - Show help message
- `/status` - Check connection status
- `/setdestination` - Set current chat as destination for WhatsApp messages

## Troubleshooting

- **WhatsApp disconnects**: You may need to restart the application and scan the QR code again
- **Messages not being forwarded**: Make sure you've set the destination chat using `/setdestination`
- **Media not being forwarded**: Check the console logs for any errors related to media handling

## For Production Use

For running this integration in a production environment, please refer to the `deployment_instructions.md` file for detailed instructions on setting up the integration as a persistent service.

## Limitations

- The WhatsApp connection requires scanning a QR code every 14-30 days (WhatsApp's limitation)
- The integration currently only forwards incoming messages, not outgoing ones
- Only image media is fully supported; other media types may have limited support

## Security Considerations

- Keep your Telegram bot token secure
- Be aware that anyone with access to your WhatsApp QR code can connect to your WhatsApp account
- Consider running the integration on a secure server if handling sensitive messages
