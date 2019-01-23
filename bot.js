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
//It has the collumns trigger and responce
//Create database again with CREATE TABLE Reply (trigger text, response text);
//Add data with INSERT INTO Reply (trigger, response) VALUES ('value 1', 'value 2');

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

function runSQL(command){
	console.log("Running command: "+command);
	sqlClient.query(command, (err, res) => {
		if (err) console.log(err); 
		for (let row of res.rows) {
			console.log(JSON.stringify(row));
		}
	});
}

function tellMe(message){
	client.users.get(myId).send(message);
}

//valid commands
const publicCommands = ["trist", "nut", "backmeup", "spell", "openPM"];
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "test"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;
var watching = [];

//Replies to simple phrases(do NOT ever let a trigger be empty)
const trigger = ["hello there", 
	 	"hit or miss", 
	 	"ayy", 
	 	"399", 
	 	"sad",
	 	"wae",
		"rule 34",
		"respect",
		"cake",
		"mom's spagetti",
		"thelegend27",
		"ligma"];
const responce = ["General Kenobi!", 
	  	"I guess they never miss, HUH", 
  		"lmao", 
		"BUT CAN YOU DO DIS",
		"This is so sad, Alexa play despacito",
	 	"Do you know da wae?",
	 	"There is porn of it, no exceptions",
	 	"Press f to pay respects",
	 	"The cake is a lie!",
		`His palms are sweaty, knees weak, arms are heavy
There's vomit on his sweater already, mom's spaghetti
He's nervous, but on the surface he looks calm and ready
To drop bombs, but he keeps on forgettin'
What he wrote down, the whole crowd goes so loud
He opens his mouth, but the words won't come out
He's chokin', how, everybody's jokin' now
The clocks run out, times up, over, blaow!`,
	  	"Have you heard of thelegend27?",
	 	"Ligma ma balls, haha gottem",
	 	`I'm supposed to be playing Game Of War but this one player keeps kicking my ass.
Is it TheLegend27?!
Yeah, TheLegend27.
Who is the legend 27?
Some say TheLegend27 is the first Game Of War player ever.
Born from fire.
I heard, TheLegend27 can hurl a boulder farther than a catapult.
I heard TheLegend27 once defeated an entire army with a single blow.`];

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
				case "runSQL":
					runSQL(command.slice(1).join(" "));
				case "addReply":
					console.log("INSERT INTO Reply (trigger, response) VALUES ('"+command[1].replace("-", " ")+
					       "', '"+command[2].replace("-", " ")+"');");
				case "test":
					break;
			}
		}
	}
	//Reply to phraces
	if(message.author.id !== botId){
		for(var i = 0; i < trigger.length; i++){
			if(message.content.toLowerCase().indexOf(trigger[i]) >= 0){
				message.reply(responce[i]);
			}
		}
	}
	//recording code
	if(recording && !message.author.bot && message !== undefined){
		tellMe(message.author.username+": "+message.content);
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
