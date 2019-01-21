//The good stuff: 
//send message: message.channel.send("");
//reply to command message.reply("");
//access a variable

const Discord = require('discord.js');
const client = new Discord.Client();
const http = require('http');
const path = require('path');

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

//stuff to print spell requests
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

function tellMe(message){
	client.users.get(myId).send(message);
}

//valid commands
const publicCommands = ["trist", "nut", "backmeup", "spell", "openPM"];
const privateCommands = ["me", "us", "start", "stop", "watch"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;
var watching = [];

//Replies to simple phrases(do NOT let a trigger be empty, or let the responce contain the trigger)
const trigger = ["hello there", 
		 "hit or miss", 
		 "ayy", 
		 "399", 
		 "sad"];
const responce = ["General Kenobi!", 
		  "I guess they never miss, HUH", 
		  "lmao", 
		  "BUT CAN YOU DO DIS",
		  "This is so sad, Alexa play despacito"];

//The main thing
client.on('message', message => {
	if(message.content[0] === "!" && !(iDecide && message.author.id !== myId)){
		command = message.content.slice(1).split(" ");
		keyword = command[0];
		if(publicCommands.includes(keyword)){
			//public commands
			if(message.guild !== null){
				console.log("Attempting to run public command "+message.content+" on the server "+
				message.guild.name+" for "+message.author.username);
				if(message.author.id !== myId){
					tellMe(message.author.username+" is running command "+
						message.content+" on server "+message.guild.name);
				}
			}else{
				console.log("Attempting to run public command "+message.content+" in a dm for "+message.author.username);
				if(message.author.id !== myId){
					tellMe(message.author.username+" is running command "+
						message.content+" through a DM");
				}
			}
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
			}
		}else if(privateCommands.includes(keyword) && message.author.id === myId){
			//private commands
			if(message.guild !== null){
				console.log("Attempting to run private command "+message.content+" on the server "+
				message.guild.name+" for "+message.author.username);
			}else{
				console.log("Attempting to run private command "+message.content+" in a dm for "+message.author.username);
			}
			switch(keyword){
				case "me":
					message.channel.send("Bot controll claimed by Jakob!");
					iDecide = true;
					break;
				case "us":
					message.channel.send("Bot retaken by the people!");
					iDecide = false;
					break;
				case "start":
					tellMe("Started recording messages.");
					recording = true;
					break;
				case "stop":
					tellMe("Stopped recording messages.");
					recording = false
					break;
				case "suicide":
					client.destroy();
					break;
			}
		}
	}
	for(var i = 0; i < trigger.length; i++){
		if(message.content.toLowerCase().indexOf(trigger[i]) >= 0){
			message.reply(responce[i]);
		}
	}
	if(recording && !message.author.bot && message !== undefined){
		tellMe(message.author.username+": "+message.content);
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
