import "./config.js";
import Client from "./client/Client.js";

export const client = new Client();

process.env.YTDL_NO_UPDATE = true;

client.developerMode = /^(dev|test)$/gi.test(process.argv.at(2));
client.login([process.env.TOKEN, process.env.DEV_TOKEN][+client.developerMode]);

/*
git init
heroku git:remote -a raee
git add .
git commit -am "make it better"
git push heroku master
*/