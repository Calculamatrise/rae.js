import "./config.js";
import Client from "./client/Client.js";

export const client = new Client();

process.env.YTDL_NO_UPDATE = true;

client.developerMode = /^(dev|test)$/gi.test(process.argv.at(2));
client.login([process.env.TOKEN, process.env.DEV_TOKEN][+client.developerMode]);