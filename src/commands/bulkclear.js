import quickReply from "./utils/quickReply.js";

/**
 * Delete most recent 100 messages in channel
 *
 * @param {Interaction} interaction
 */
async function bulkclear(interaction) {
	let deleted = await interaction.channel.bulkDelete(100);
	await quickReply(interaction, `Deleted ${deleted.size} messages`);
}

export default bulkclear;
