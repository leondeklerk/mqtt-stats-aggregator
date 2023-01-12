import * as mqtt from "mqtt";
import fs from "fs";
import * as dotenv from "dotenv";
import { CronJob } from "cron";
import path from "path";
dotenv.config();

let client: mqtt.MqttClient | null = null;
let pending: string[] = [];

new CronJob(
	"00 30 00 * * *",
	() => {
		pending = [];
		if (client !== null) {
			console.info(new Date().toString(), "- Closing dangling client");
			client.end(undefined, undefined, () => {
				client = run();
			});
		} else {
			client = run();
		}
	},
	null,
	true,
	process.env?.MQTT_TZ || "Europe/Amsterdam"
);

function run() {
	console.info(new Date().toString(), "- Started a run");
	// Create the connection options
	const options = {
		rejectUnauthorized: true,
	} as mqtt.IClientOptions;

	options.host = process.env?.MQTT_HOST || "localhost";
	options.port = parseInt(process.env?.MQTT_PORT || "1883");

	// Ignore as we don't do any checks on the protocol value.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	options.protocol = process.env?.MQTT_PROTOCOL;

	if (process.env?.MQTT_CA_FILE) {
		const CA = fs.readFileSync(path.join(__dirname, `../config/${process.env.MQTT_CA_FILE}`));
		options.ca = CA;
	}

	options.username = process.env?.MQTT_USERNAME;
	options.password = process.env?.MQTT_PASSWORD;

	const client = mqtt.connect(options);

	// Get the device topics
	const topicString = process.env?.MQTT_TOPICS || "";
	const topics = topicString.split(",");

	client.on("connect", () => {
		for (const topic of topics) {
			pending.push(topic);
			client.subscribe(`stat/${topic}/RESULT`);
			console.info(new Date().toString(), "-", "Published to:", topic);
			client.publish(`cmnd/${topic}/EnergyYesterday`, "");
		}
	});

	client.on("message", onMessage);

	client.on("error", (error) => {
		console.log(new Date().toString(), "- Client error", error);
	});
	return client;
}

function onMessage(topic: string, message: Buffer) {
	console.info(new Date().toString(), "-", "Received from:", topic);
	const parts = topic.split("/");
	// Only parse statistic messages
	if (parts[0] === "stat") {
		// Find the correct device
		const device = parts[1] || "fallback";
		const data = JSON.parse(message.toString());

		// Get the necessary device data
		if (data["EnergyYesterday"]) {
			// Actual usage of the previous day
			const usage = data["EnergyYesterday"]["Yesterday"];

			if (usage !== null && usage !== undefined && usage !== "") {
				console.info(new Date().toString(), "-", "Parsed:", topic, usage);

				// Format date to string: YYYY-MM-DD
				const date = new Date();
				date.setDate(date.getDate() - 1);
				const month = (date.getMonth() + 1).toString().padStart(2, "0");
				const day = date.getDate().toString().padStart(2, "0");
				const dateString = `${date.getFullYear()}-${month}-${day}`;

				if (device === "fallback") {
					writeToFile(device, `${dateString},${topic},${usage}`);
				} else {
					writeToFile(device, `${dateString},${usage}`);
				}
			}
		}
		pending = pending.filter((value) => value !== device);
	}
	client?.unsubscribe(topic);
	if (pending.length === 0) {
		client?.end();
		client = null;
	}
}

function writeToFile(fileName: string, content: string) {
	fs.access(path.join(__dirname, `../data/${fileName}`), fs.constants.F_OK, (err) => {
		if (err) {
			let header = "date,usage";
			if (fileName === "fallback") {
				header = "date,topic,usage";
			}

			fs.writeFile(path.join(__dirname, `../data/${fileName}`), `${header}\n${content}\n`, (err) => {
				if (err) {
					console.log("Write error:", err);
				}
			});
		} else {
			fs.appendFile(path.join(__dirname, `../data/${fileName}`), `${content}\n`, (err) => {
				if (err) {
					console.log("Append error:", err);
				}
			});
		}
	});
}
