const Discord = require('discord.js');
const client = new Discord.Client();

//api for spells n stuff
const http = require('http');

//for db stuff
const { Client } = require('pg');
const sqlClient = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: true,
});
sqlClient.connect();
//The table is called "Reply" with big R
//It has the collumns trigger and response
//Create database again with CREATE TABLE Reply (trigger text, response text);
//Add data with INSERT INTO Reply (trigger, response) VALUES ('value 1', 'value 2');

client.on('ready', () => {
	console.log('I am ready!');
});

var lastMessageObject;
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
	lastMessageObject.reply(data["name"]+" is a "+data["level"]+". level "+data["school"]["name"]+` spell.
It has a casting time of `+data["casting_time"]+", its "+ritual+"a ritual and a range of "+data["range"]+`.
Its duration is `+data["duration"]+" and it is "+con+"concentration. Its component(s) are "+data["components"].join(" ")+`
It can be found here: `+data["page"]);
	for(var i = 0; i<data["desc"].length; i++){
		lastMessageObject.reply(data["desc"][i]);
	}
}

function runSQL(command, onCompletion){
	sqlClient.query(command, (err, res) => {
		if (err) console.log(err);
		for (let row of res.rows) {
			console.log(JSON.stringify(row));
		}
		console.log(res.rows);
		if(onCompletion){
			onCompletion();
		}
	});
}

function tellMe(message){
	client.users.get(myId).send(message);
}

//valid commands
const publicCommands = ["trist", "nut", "backmeup", "spell", "openPM"];
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "addReply", "test"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;
var firstResponce = "";

//The main thing
client.on('message', message => {
	lastMessageObject = message;
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
				case "runSQL":
					runSQL(command.slice(1).join(" "));
					break;
				case "addReply":
					runSQL("INSERT INTO Reply (trigger, response) VALUES ('"+command[1].replace(/-/g, " ")+
					       "', '"+command[2].replace(/-/g, " ")+"');");
					break;
				case "test":
					break;
			}
		}
	}
	//Reply to phraces
	if(message.author.id !== botId){
		runSQL("SELECT response FROM Reply WHERE trigger LIKE '%"+message.content+"%';", function(){
			lastMessageObject.channel.send(res.rows[0].response);
		});
		/*if(potencialReply && potencialReply.length > 0){
			message.channel.send(potencialReply[0].responce);
		}*/
	}
	//recording code
	if(recording && !message.author.bot && message !== undefined){
		tellMe(message.author.username+": "+message.content);
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
