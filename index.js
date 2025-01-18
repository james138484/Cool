const express = require('express');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

// Set up the Express app
const app = express();

// Create a new Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Storage for logs and notes
let modLogs = [];
let userNotes = {};

// When the bot logs in successfully
client.once('ready', () => {
    console.log('Bot is online!');
});

// Set up a ping-pong command for fun
client.on('messageCreate', (message) => {
    if (message.content.toLowerCase() === 'ping') {
        message.reply('pong');
    }
});

// Add a mute command with a reason
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!mute') && message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
        let args = message.content.split(' ').slice(1);
        let target = message.mentions.members.first();
        let reason = args.slice(1).join(' ') || 'No reason provided';

        if (!target) {
            return message.reply('Please mention a user to mute and provide a reason.');
        }

        if (target.voice.channel) {
            await target.voice.setMute(true, reason);
            modLogs.push({ action: 'Mute', user: target.user.username, reason: reason, timestamp: Date.now() });
            return message.reply(`Muted ${target.user.username} for reason: ${reason}`);
        } else {
            return message.reply('This user is not in a voice channel.');
        }
    }
});

// Add a kick command with a reason
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!kick') && message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        let args = message.content.split(' ').slice(1);
        let target = message.mentions.members.first();
        let reason = args.slice(1).join(' ') || 'No reason provided';

        if (!target) {
            return message.reply('Please mention a user to kick and provide a reason.');
        }

        await target.kick(reason);
        modLogs.push({ action: 'Kick', user: target.user.username, reason: reason, timestamp: Date.now() });
        return message.reply(`Kicked ${target.user.username} for reason: ${reason}`);
    }
});

// Add a ban command with a reason
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!ban') && message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        let args = message.content.split(' ').slice(1);
        let target = message.mentions.members.first();
        let reason = args.slice(1).join(' ') || 'No reason provided';

        if (!target) {
            return message.reply('Please mention a user to ban and provide a reason.');
        }

        await target.ban({ reason: reason });
        modLogs.push({ action: 'Ban', user: target.user.username, reason: reason, timestamp: Date.now() });
        return message.reply(`Banned ${target.user.username} for reason: ${reason}`);
    }
});

// Add a note command
client.on('messageCreate', (message) => {
    if (message.content.startsWith('!note') && message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const args = message.content.split(' ').slice(1);
        let target = message.mentions.members.first();
        const note = args.slice(1).join(' ') || 'No note provided';

        if (!target) {
            return message.reply('Please mention a user and provide a note.');
        }

        if (!userNotes[target.id]) {
            userNotes[target.id] = [];
        }
        userNotes[target.id].push(note);
        return message.reply(`Added a note for ${target.user.username}: "${note}"`);
    }
});

// Command to read notes
client.on('messageCreate', (message) => {
    if (message.content.startsWith('!readnote') && message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('Please mention a user to read notes for.');
        }

        if (!userNotes[target.id] || userNotes[target.id].length === 0) {
            return message.reply('This user has no notes.');
        }

        const notesList = userNotes[target.id].map((note, index) => `${index + 1}. ${note}`).join('\n');
        return message.reply(`Notes for ${target.user.username}:\n${notesList}`);
    }
});

// Command to see mod logs (mutes, warns, etc.)
client.on('messageCreate', (message) => {
    if (message.content === '!modlogs' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        if (modLogs.length === 0) {
            return message.reply('No mod logs available.');
        }

        const logsList = modLogs.map((log) => {
            return `${new Date(log.timestamp).toLocaleString()} - ${log.action.toUpperCase()} - ${log.user} (Reason: ${log.reason})`;
        }).join('\n');

        return message.reply(`Mod logs:\n${logsList}`);
    }
});

// Endpoint to keep the bot alive
app.get('/', (req, res) => {
    res.send('Bot is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// Log in with your bot token
client.login(process.env.BOT_TOKEN);
