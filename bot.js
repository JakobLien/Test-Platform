//The good stuff: 
//send message: message.channel.send("");
//reply to command message.reply("");
//access a variable

const Discord = require('discord.js');
const client = new Discord.Client();
const http = require('http');

client.on('ready', () => {
	console.log('I am ready!');
});

var last_message_object;
var spellLink;

//Stuff to deal with d&d spell requests
function getSpellData(spellName){
	http.get('http://www.dnd5eapi.co/api/spells/?name='+spellName, (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			try{
				spellLink = (JSON.parse(data))["results"][0]["url"];
				http.get(spellLink, (resp) => {
					let data = '';
					resp.on('data', (chunk) => {
						data += chunk;
					});
					resp.on('end', () => {
						printSpellData(JSON.parse(data));
					});
				}).on("error", (err) => {
					console.log("Error(2): " + err.message);
				});
			}catch(err){
				last_message_object.reply("That spell was not found. (The error message goes: "+err+")");
			}
		});
		}).on("error", (err) => {
			console.log("Error(1): " + err.message);
		});
}

var con;
var ritual;
function printSpellData(data){
	if(data["concentration"] === "no"){con = "not "}else{con = ""}
	if(data["ritual"] === "no"){ritual = "not "}else{ritual = ""}
	last_message_object.reply(data["name"]+" is a "+data["level"]+". level "+data["school"]["name"]+` spell.
It has a casting time of `+data["casting_time"]+", its "+ritual+"a ritual and a range of "+data["range"]+`.
Its duration is `+data["duration"]+" and it is "+con+"concentration. Its component(s) are "+data["components"].join(" ")+`
It can be found here: `+data["page"]);
	for(var i = 0; i<data["desc"].length; i++){
		last_message_object.reply(data["desc"][i]);
	}
}

var modding = {};
var iDecide = false;
const myUserName = "jlien11";
var publicCommands = ["trist", "nut", "backmeup", "spell", "openPM"];
var privateCommands = ["startMod", "stopMod", "stopAllMod", "me", "us"];
client.on('message', message => {
	if(message.content[0] === "!" && !(iDecide && message.author.username !== myUserName)){
		command = message.content.slice(1).split(" ");
		keyword = command[0];
		if(publicComands.includes(keyword)){
			console.log("Attempting to run command "+message.content+" on the server "+message.guild.name+" for "+message.author.username);
			switch(keyword){
				case 'trist':
					message.reply('Jakob er trist!');
					break;
				case "nut":
					message.channel.send(":weary: :ok_hand: :sweat_drops:");
					break;
				case "backmeup":
					message.reply("This person is correct!");
					break;
				case "spell":
					last_message_object = message;
					getSpellData(command.slice(1).join("+"));
					break;
				case "openPM":
					console.log(message.author.username+" has opened PM");
					message.author.send("Hello there");
					break;
		}else if(privateCommands.includes(keyword) && message.author.username === myUserName){
			switch(keyword){
				case "startMod":
					modding[message.channel] = command.slice(1).join(" ");
					break;
				case "stopMod":
					modding[message.channel] = "";
					break;
				case "stopAllMod":
					modding = {};
					break;
				case "me":
					message.channel.send("Bot controll claimed by Jakob!");
					iDecide = true;
					break;
				case "us":
					message.channel.send("Bot retaken by the people!");
					iDecide = false;
			}
		}
	}
	if(modding[message.channel] && !message.author.bot){
		console.log("Message: "+message.content+" was changed to "+modding[message.channel]);
		message.delete();
		message.channel.send(message.author.username+"just wrote "+modding[message.channel]);
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
