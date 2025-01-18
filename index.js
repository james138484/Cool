const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Set up Express app
const app = express();

// Create a Discord bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// When the bot logs in successfully
client.once('ready', () => {
    console.log('Bot is online!');
});

// Respond to a message containing 'ping' with 'pong'
client.on('messageCreate', (message) => {
    if (message.content === 'ping') {
        message.reply('pong!');
    }
});

// Create an endpoint to keep the bot alive with a web server
app.get('/', (req, res) => {
    res.send('Bot is running...');
});

// Use the port (default 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// Log the bot in with the token stored in .env file
client.login(process.env.BOT_TOKEN);
