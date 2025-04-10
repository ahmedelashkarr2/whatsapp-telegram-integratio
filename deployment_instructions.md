# Deployment Instructions for WhatsApp-Telegram Integration

This document provides instructions for deploying the WhatsApp-Telegram integration system as a persistent service.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A server or VPS with Linux (Ubuntu recommended)
- WhatsApp account
- Telegram bot token

## Installation

1. Clone or copy the integration files to your server:
   ```
   git clone https://github.com/yourusername/whatsapp-telegram-integration.git
   cd whatsapp-telegram-integration
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a file named `telegram-token.txt` and add your Telegram bot token:
   ```
   echo "YOUR_TELEGRAM_BOT_TOKEN" > telegram-token.txt
   ```

## Running as a Systemd Service

To ensure the integration runs continuously and starts automatically on system boot:

1. Create a systemd service file:
   ```
   sudo nano /etc/systemd/system/whatsapp-telegram.service
   ```

2. Add the following content (adjust paths as needed):
   ```
   [Unit]
   Description=WhatsApp to Telegram Integration Service
   After=network.target

   [Service]
   Type=simple
   User=YOUR_USERNAME
   WorkingDirectory=/path/to/whatsapp-telegram-integration
   ExecStart=/usr/bin/node app.js
   Restart=on-failure
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=whatsapp-telegram

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```
   sudo systemctl enable whatsapp-telegram.service
   sudo systemctl start whatsapp-telegram.service
   ```

4. Check service status:
   ```
   sudo systemctl status whatsapp-telegram.service
   ```

## Running with PM2 (Alternative Method)

PM2 is a process manager for Node.js applications that helps keep applications online.

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the application with PM2:
   ```
   pm2 start app.js --name "whatsapp-telegram"
   ```

3. Configure PM2 to start on system boot:
   ```
   pm2 startup
   pm2 save
   ```

## First-Time Setup

After deployment, you need to complete these one-time setup steps:

1. When the service starts for the first time, it will generate a QR code
2. Scan this QR code with your WhatsApp mobile app (Settings > Linked Devices > Link a Device)
3. Open Telegram and find your bot
4. Send the command `/setdestination` to your bot to set your chat as the destination for WhatsApp messages

## Monitoring and Maintenance

- Check service logs:
  ```
  # For systemd
  sudo journalctl -u whatsapp-telegram.service
  
  # For PM2
  pm2 logs whatsapp-telegram
  ```

- Restart the service:
  ```
  # For systemd
  sudo systemctl restart whatsapp-telegram.service
  
  # For PM2
  pm2 restart whatsapp-telegram
  ```

## Troubleshooting

- If WhatsApp disconnects, you may need to restart the service and scan the QR code again
- Check the logs for any error messages
- Ensure your server has a stable internet connection
- Verify that your Telegram bot token is correct

## Security Considerations

- Keep your telegram-token.txt file secure
- Consider running the service behind a firewall
- Regularly update Node.js and npm packages
