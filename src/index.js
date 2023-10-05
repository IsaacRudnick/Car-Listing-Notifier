import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
// Get CLIENT_ID and CLIENT_TOKEN from .env file
dotenv.config();

const commands = [
	{
		name: "ping",
		description: "Replies with Pong!",
	},
	{
		name: "refresh",
		description: "Refreshes list of cars",
	},
	{
		name: "bulkclear",
		description: "Deletes all messages in channel",
	},
];

const rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);

try {
	console.log("Started refreshing application (/) commands.");

	await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
		body: commands,
	});

	console.log("Successfully reloaded application (/) commands.");
} catch (error) {
	console.error(error);
}

import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// On bot start, log to console
client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// Slash commands that point to imported files
import ping from "./commands/ping.js";
import refresh from "./commands/refresh.js";
import bulkclear from "./commands/bulkclear.js";

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	else if (interaction.commandName === "ping") {
		await ping(interaction);
	} else if (interaction.commandName === "refresh") {
		await refresh(interaction);
	} else if (interaction.commandName === "bulkclear") {
		await bulkclear(interaction);
	}
});

// Finally, log into client
client.login(process.env.CLIENT_TOKEN);
