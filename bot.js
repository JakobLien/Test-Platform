const Discord = require('discord.js');
const client = new Discord.Client();

//api for spells n stuff
const http = require('http');

//for db stuff
var mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect();
//The table is called "Reply" with big R
//It has the collumns triggers and responses
//Create database again with CREATE TABLE Reply (triggers text, responses text);
//Add data with INSERT INTO Reply (triggers, responses) VALUES ('value 1', 'value 2');
//DATABASE NAME: nn0cp329p81ljw62

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
	for(let i = 0; i<data["desc"].length; i++){
		lastMessageObject.reply(data["desc"][i]);
	}
}

function runSQL(query){
	try{
		return new Promise(function(resolve, reject){
			connection.query(query, function(err, rows, fields) {
				if (err) console.log(err);
				resolve(rows);
			});
		});
	}catch(e){
		console.log(e);
		return null;
	}
}

function tellMe(message){
	client.users.get(myId).send(message);
}

//valid commands
const publicCommands = ["trist", "nut", "backmeup", "spell", "openPM", "fish", "immy", "money"];
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "test"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;

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
				case "spell":
					last_message_object = message;
					getSpellData(command.slice(1).join("+"));
					break;
				case "openPM":
					TellMe(message.author.username+" has opened PM");
					message.author.send("Hello there");
					break;
				case "immy":
					runSQL("SELECT sitat FROM sitat ORDER BY RAND() LIMIT 1;").then(function(returned){
						message.reply(returned[0].sitat);
					});
					break;
				case "fish":
					let roll = Math.floor(Math.random()*20)+1;
					if(roll === 20){
						message.reply("You rolled a natural twenty. Fetching keyword. . .");
						runSQL("SELECT triggers FROM reply ORDER BY RAND() LIMIT 1;").then(function(returned){
							if(message.guild !== null){
								message.author.send("Your keyword is: "+returned[0].triggers);
							}else{
								message.reply("Your keyword is: "+returned[0].triggers);
							}
						});
					}else{
						message.reply("You rolled a nat "+roll+", which sadly is not enough for anything.");
					}
					break;
				case "createAccount":
					runSQL("SELECT * FROM economy WHERE UserID = '"+message.author.id+"';").then(function(returned){
						console.log(returned.length, !returned.length);
						if(!returned.length){
							runSQL("INSERT INTO economy VALUES ('"+message.author.username+"', '"+message.author.id+"', DEFAULT);").then(function(returned2){
								message.reply("You have successfully created an account.");
							});
						}else{
							message.reply("You have already created an account");
						}
					})
					break;
				case "money":
					runSQL("SELECT Money FROM economy WHERE UserID = '"+message.author.id+"';").then(function(returned){
						message.reply("You have "+returned[0].Money+" money");
					});
					break;
				case
			}
		}else if(privateCommands.includes(keyword) && message.author.id === myId){
			//private commands
			if(message.guild !== null){
				console.log("Attempting to run private command "+message.content+" on the server "+
				message.guild.name+" for "+message.author.username);
			}else{
				console.log("Attempting to run private command "+message.content+" in a dm for "+
					    message.author.username);
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
					try{
						runSQL(command.slice(1).join(" ")).then(function(returned){
							console.log(returned);
							returned.forEach(function(item, index){
								console.log(item);
							});
						});
					}catch(e){
						message.reply("Something went wrong. error message: "+e)
					}
					break;
				case "test":
					client.setTimeout(function(){
						message.reply("timeout set");
					}, command[1]);
					break;
			}
		}
	}
	
	//Reply to phraces
	if(message.author.id !== botId){
		try{
			//SELECT * FROM Reply WHERE 0 < LOCATE(triggers, "adsfjadsoifjoisadfoij399asdasd");
			let promise1 = runSQL("SELECT responses FROM Reply WHERE 0 < LOCATE(triggers, '"+
					      message.content.toLowerCase().replace("'", "\\'")+"');");
			promise1.then(function(returned){
				for(let i = 0; i < returned.length; i++){
					if(returned[i].responses.length > 1900){
						for(let a = 0; a < returned[i].responses.length/1900; a++){
							message.reply(returned[i].responses.slice(a*1900, (a+1)*1900));
						}
					}else{
						message.reply(returned[i].responses);
					}
				}
			});
		}catch(e){
			console.log(e);
		}
	}
	//recording code
	if(recording && !message.author.bot && message !== undefined){
		tellMe(message.author.username+": "+message.content);
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
