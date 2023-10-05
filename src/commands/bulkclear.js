import quickReply from "./utils/quickReply.js";

/**
 * Delete most recent 100 messages in channel
 *
 * @param {Interaction} interaction
 */
async function bulkclear(interaction) {
	await interaction.channel.bulkDelete(100);
	await quickReply(interaction, "Deleted 100 messages");
}

export default bulkclear;
