const Discord = require('discord.js');
const client = new Discord.Client();

//api for spells n stuff
const http = require('http');

//for db stuff
var mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);
connection.connect();

client.on('ready', () => {
	console.log('I am ready!');
});

//Stuff to deal with d&d spell requests
function getSpellData(spellName){
	return new Promise(function(resolve, reject){
		http.get('http://www.dnd5eapi.co/api/spells/?name='+spellName, (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				try{
					let spellLink = (JSON.parse(data))["results"][0]["url"];
					http.get(spellLink, (resp) => {
						let data = '';
						resp.on('data', (chunk) => {
							data += chunk;
						});
						resp.on('end', () => {
							resolve(formatSpellData(JSON.parse(data)));
						});
					}).on("error", (err) => {
						console.log("Error(2): " + err.message);
					});
				}catch(err){
					console.log("That spell was not found. (The error message goes: "+err+")");
				}
			});
		}).on("error", (err) => {
			console.log("Error(1): " + err.message);
		});
	});
}

//stuff to print spell requests
function formatSpellData(data){
	let info = ""
	if(data["concentration"] === "no"){con = "not "}else{let con = ""}
	if(data["ritual"] === "no"){ritual = "not "}else{let ritual = ""}
	info += (data["name"]+" is a "+data["level"]+". level "+data["school"]["name"]+` spell.
It has a casting time of `+data["casting_time"]+", its "+ritual+"a ritual and a range of "+data["range"]+`.
Its duration is `+data["duration"]+" and it is "+con+"concentration. Its component(s) are "+data["components"].join(" ")+`
It can be found here: `+data["page"]);
	for(let i = 0; i<data["desc"].length; i++){
		info += data["desc"][i]+"\n";
	}
	return info;
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

function rollDice(dice){
	return Math.floor(Math.random()*dice)+1
}

function tellMe(message){
	client.users.get(myId).send(message);
}

//valid commands
const publicCommands = ["help", "trist", "nut", "openPM", //various stuff
			"spell", "immy", "fish", "AO", //specific stuff
			"createAccount", "money", "donate"]; //capitalist stuff
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "test"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;

//communist constants
const comList = ["vi", "oss", "vår", "våre"];
const comValues = [["eg", "jeg", "du", "han", "ho", "det"], ["me", "meg", "deg", "seg"], 
		   ["min", "din", "hans", "hennes"], ["mine", "dine"]];

message.content.replace(/ eg | jeg | du /gi, " vi ")
.replace(/ me | han | ho /gi, " oss ")
.replace(/ min | din | hans | hennes /gi, " vår ")
.replace(/ mine | dine | demmers | dokkers /gi, " våres ");

//The main thing
client.on('message', message => {
	lastMessageObject = message;
	if(message.content[0] === "!" && !(iDecide && message.author.id !== myId)){
		let command = message.content.slice(1).split(" ");
		let keyword = command[0];
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
					if(!(message.author.id === "387019040939573248" && keyword === "AO")){
						tellMe(message.author.username+" is running command "+
							message.content+" through a DM");
					}
				}
			}
			switch(keyword){
				//various stuff
				case "help":
					message.reply("All public commands: "+publicCommands.join(", "));
					break;
				case "trist":
					message.reply('Jakob er trist!');
					break;
				case "nut":
					message.channel.send(":weary: :ok_hand: :sweat_drops:");
					break;
				case "openPM":
					TellMe(message.author.username+" has opened PM");
					message.author.send("Hello there");
					break;
				//specific stuff
				case "spell":
					getSpellData(command.slice(1).join("+")).then(function(returned){
						message.reply(returned);
					});
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
				case "AO":
					let responce = "";
					let sumDmg = 0;
					for(let i = 0; i < 10; i++){
						let d20 = rollDice(20)+8;
						if(d20 === 28){
							let dmg = rollDice(4)+rollDice(4)+4;
							sumDmg += dmg;
							responce += "A natural fucking twenty hits, dealing "+dmg+" damage \n";
						}else if(d20 === 9){
							responce += "A natural fucking one misses \n";
						}else if(d20 >= command[1]){
							let dmg = rollDice(4)+4;
							sumDmg += dmg;
							responce += "A "+d20+" hits, dealing "+dmg+" damage \n";
						}else{
							responce += "A "+d20+" misses \n";
						}
					}
					responce += "Overall you dealt "+sumDmg;
					message.reply(responce);
					break;
				//capitalist stuff
				case "createAccount":
					runSQL("SELECT * FROM economy WHERE UserID = '"+message.author.id+"';").then(function(returned){
						if(!returned.length){
							runSQL("INSERT INTO economy VALUES ('"+message.author.username+"', '"+
							message.author.id+"', DEFAULT);").then(function(returned2){
								message.reply("You have successfully created an account.");
							});
						}else{
							message.reply("You have already created an account");
						}
					})
					break;
				case "money":
					runSQL("SELECT Money FROM economy WHERE UserID = '"+message.author.id+"';").then(
					function(returned){
						message.reply("You have "+returned[0].Money+" money");
					});
					break;
				case "donate":
					if(0 < command[2] && message.author.id !== message.mentions.users.first().id){
						runSQL("UPDATE economy SET Money = Money-"+command[2]+" WHERE UserID = '"+
						message.author.id+"';").then(function(returned){
							message.reply("money successfully detracted from your account");
							runSQL("UPDATE economy SET Money = Money+"+command[2]+" WHERE UserID = '"+
							       message.mentions.users.first().id+"';").then(function(returned2){
								message.reply("money successfully added to the other account");
							});
						});
					}else if(0 >= command[2]){
						message.reply("You can't donate less than 1 money");
					}else{
						message.reply("You can't donate money to yourself");
					}
					break;
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
		//Phraces from database
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
		/*
		//Phrases from communism
		
		if(response !== message.content){
			message.reply("Meint du ikke:\n"+response);
		}*/
		
		//phrases from communism
		let words = message.content.toLowerCase().split();
		for(let i = 0; i < words.length; i++){
			if(false){
				
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
