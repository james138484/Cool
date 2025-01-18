const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // To load environment variables

// Set up the Express app
const app = express();

// Create a new Discord client
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

// Endpoint to keep bot alive (can be useful for services like Render)
app.get('/', (req, res) => {
    res.send('Bot is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// Log in with your bot token stored in .env file
client.login(process.env.BOT_TOKEN);
