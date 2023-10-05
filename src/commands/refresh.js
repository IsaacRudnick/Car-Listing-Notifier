import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";
import quickReply from "./utils/quickReply.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * This function is called when the user types /refresh in the Discord channel
 * It will refresh the listings in the channel, which means it will:
 * 1. Get the listings from the website
 * 2. Get the listings in the Discord channel
 * 3. Compare the listings from the website to the listings in the Discord channel
 * 4. If a listing is:
 *    The same in the channel and on the website, do nothing
 * 	  Not in the channel at all, add it to the channel
 *    In the channel w/ different details (e.g. price) than on the website, update the Discord channel listing
 * 5. TODO: If a listing is in the Discord channel but not in the website, remove it from the Discord channel
 * @param {Interaction} interaction
 */
async function refresh(interaction) {
	let numOfChanges = 0;
	// Get cars from website (Car objects)
	const onlineCars = await getOnlineCars();
	const discordMessages = await interaction.channel.messages.fetch({
		limit: 100,
	});
	// Get cars postings only in Discord channel (Discord.Message objects)
	const discordCars = discordMessages.filter((msg) => {
		return msg.embeds.length > 0;
	});

	for (let i = 0; i < onlineCars.length; i++) {
		const car = onlineCars[i];

		// Check if car w/ same details is in Discord channel
		let hasExactMatch = await Array.from(discordCars.values()).some((msg) => {
			return messageUTD(msg, car);
		});

		if (hasExactMatch) {
			continue;
		}

		numOfChanges++;
		// If no exact match, there is either a partial match or the car is entirely new
		//Determine which of these things is the case below

		// Check if car w/ same VIN (but different info) is in Discord channel
		let matchingVINs = discordCars.filter((msg) => {
			// the VIN is stored in the 5th field of the embed (index 4)
			// trim() to remove whitespace (issues arise otherwise)
			return msg.embeds[0].fields[4].value.trim() == car.vin.trim();
		});
		let hasOutdatedMatch = matchingVINs.size >= 1;
		if (hasOutdatedMatch) {
			// Get first message w/ matching VIN
			// If multiple messages have same VIN, only edit first one and ignore previous messages
			Array.from(matchingVINs.values())[0].edit({
				embeds: [await createEmbed(car)],
			});
		}

		// If no VIN match, must be entirely new car; create new embed
		else {
			interaction.channel.send({ embeds: [await createEmbed(car)] });
		}
	}

	await quickReply(interaction, `Refreshed! ${numOfChanges} changes made.`);
}

/**
 * This function will check if a Discord message is an exact match for a car
 * This means all values are equivalent in both the Discord message's Embed and the Car object
 * @param {Discord.Message} message
 * @param {Car} car
 * @returns true if message is exact match for car (Up To Date), false otherwise
 */
async function messageUTD(message, car) {
	let embed = message.embeds[0].data;
	let fields = embed.fields;
	return (
		car.name == embed.title &&
		car.url == embed.url &&
		car.imageUrl == embed.image.url &&
		car.price == fields[0].value &&
		car.mileage == fields[1].value &&
		car.externalColor == fields[2].value &&
		car.internalColor == fields[3].value &&
		car.vin == fields[4].value
	);
}

/**
 * Makes web request to URL specified in .env file w/ specified parameters in URL
 *
 * @returns {Car[]} An array of Car objects
 */
async function getOnlineCars() {
	// Get HTML from cars URL
	let res = await fetch(process.env.CARS_URL);
	let html = await res.text();

	// Get all HTML sections that begin w/ "<!-- Vehicle Start -->" and end w/ "<!-- Vehicle End -->"
	const regex = /<!-- Vehicle Start -->(.*?)<!-- Vehicle End -->/gs;
	const matches = [...html.matchAll(regex)];
	const vehicleElements = matches.map((match) => match[1].trim());

	// To get image URL, need to add baseURL to relative URL
	let searchURL = process.env.CARS_URL;
	// Remove everything after the first "/" (after "https://")
	const baseURL = searchURL.substring(
		0,
		searchURL.indexOf("/", "https://".length)
	);

	let cars = [];

	vehicleElements.forEach((element) => {
		const $ = cheerio.load(element);

		var main_div = $("div").first();

		let addCommas = (numStr) => {
			return numStr.toLocaleString("en-US");
		};

		// Car info
		let vin = main_div.data("vin");
		let url = $("a.h2").first().attr("href");
		let name = main_div.data("name");
		let imageUrl = baseURL + $("img").first().attr("src");
		let price = addCommas(main_div.data("price"));
		let mileage = addCommas(main_div.data("mileage"));
		let externalColor = main_div.data("extcolor");
		let internalColor = main_div.data("intcolor");

		let car = new Car(
			vin,
			url,
			name,
			imageUrl,
			price,
			mileage,
			externalColor,
			internalColor
		);
		// Add car to array
		cars.push(car);
	});

	return cars;
}

// To make clear the structure of each listing
class Car {
	constructor(
		vin,
		url,
		name,
		imageUrl,
		price,
		mileage,
		externalColor,
		internalColor
	) {
		this.vin = vin;
		this.name = name;
		this.url = url;
		this.imageUrl = imageUrl;
		this.price = price;
		this.mileage = mileage;
		this.externalColor = externalColor;
		this.internalColor = internalColor;
	}

	setDiscordMessageID(messageID) {
		this.messageID = messageID;
	}
}

/**
 * Creates a Discord embed from a Car object
 * @param {Car} car
 *
 * @return {Discord.MessageEmbed} A Discord embed
 */
async function createEmbed(car) {
	const embed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(car.name)
		.setURL(car.url)
		.setImage(car.imageUrl)
		.addFields(
			{ name: "Price", value: car.price },
			{ name: "Mileage", value: car.mileage },
			{ name: "External Color", value: car.externalColor, inline: true },
			{ name: "Internal Color", value: car.internalColor, inline: true },
			{ name: "VIN", value: car.vin, inline: true }
		);
	return embed;
}

export default refresh;
