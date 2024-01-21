/**
 * Send a message in reply to interaction. Delete message after timeout.
 *
 * @param {Interaction} interaction - interaction object from Discord.js
 * @param {String} message - message to send
 * @param {Number} [timeout = 3] - in seconds
 */
async function quickReply(interaction, message, timeout = 3) {
	let reply = await interaction.editReply(message);
	setTimeout(async () => await reply.delete(), timeout * 1000);
}

export default quickReply;
