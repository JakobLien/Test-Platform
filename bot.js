//add to guild: https://discordapp.com/oauth2/authorize?&client_id=530439718823788544&scope=bot&permissions=8
//programming idead: a todo list like Nils has, hangman, tic tac toe(AI?), a text based game like in BIG???, his noen nevne depressed
//poppe den ut ett inspirational quote, ett roast system så den velge ut en bra roast fra databasen og sikte den på den du @-e

//Important genereral stuff
const Discord = require('discord.js');
const client = new Discord.Client();

//api for general communication and stuff
const http = require('http');
const https = require('https');

//for db stuff
const mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);
connection.connect();

//for joining calls and stuff
const ffmpeg = require('ffmpeg');

client.on('ready', () => {
	console.log('I am ready!');
	client.fetchUser(myId).then(user => {
		if(user.presence.status === "online"){
			tellMe("I'm back");
		}
	});
});


//sendhttpRequest
function sendhttpRequest(link){
	return new Promise(function(resolve, reject){
		http.get(link, (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				resolve(JSON.parse(data));

			});
		}).on("error", (err) => {
			console.log("http error 1: " + err.message);
		});
	});
}


//sendhttpsRequest
function sendhttpsRequest(options){
	return new Promise(function(resolve, reject){
		https.request(options, (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				resolve(JSON.parse(data));
			});
		}).on("error", (err) => {
			console.log("https error 2: " + err.message);
		}).end();
	});
}

//stuff to print spell requests
function formatSpellData(data){
	let info = "";
	let con, ritual;
	if(data["concentration"] === "no"){con = "not "}else{con = ""}
	if(data["ritual"] === "no"){ritual = "not "}else{ritual = ""}
	info += (data["name"]+" is a "+data["level"]+". level "+data["school"]["name"]+` spell.
It has a casting time of `+data["casting_time"]+", its "+ritual+"a ritual and a range of "+data["range"]+`.
Its duration is `+data["duration"].toLowerCase()+" and it is "+con+"concentration. Its component(s) are "+data["components"].join(" ")+`
It can be found here: `+data["page"]);
	for(let i = 0; i<data["desc"].length; i++){
		info += "\n"+data["desc"][i];
	}
	return info;
}

//Stuff to deal with d&d spell requests
function getSpellThings(spellName){
	return new Promise(function(resolve, reject){
		sendhttpRequest('http://www.dnd5eapi.co/api/spells/?name='+spellName).then(returned =>
			sendhttpRequest(returned["results"][0]["url"]).then(returned2 => 
				resolve(formatSpellData(returned2))
			)
		);
	});
}

//stuff to interact with database using mysql
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

//function to split text into words, and symbols, so that I can replace the words perfectly
function splitSymbols(text){
	let answer = [];
	let letters = "";
	let symbols = "";
	let isLetter;
	text.split("").forEach(character => {
		isLetter = character.match(/[a-z]|æ|ø|å/i);
		if(isLetter && !letters){
			answer.push(symbols);
			symbols = "";
		}else if(!isLetter && !symbols){
			answer.push(letters);
			letters = "";
		}
		if(isLetter){
			letters += character;
		}else{
			symbols += character;
		}
	});
	answer.push(letters+symbols);
	return answer;
}

//function to split the text into 1900 character long parts so discord can deal with it
function splitText(text){
	let returnValue = []
	if(text.length > 1900){
		for(let a = 0; a < text.length/1900; a++){
			returnValue.push(text.slice(a*1900, (a+1)*1900));
		}
	}else{
		returnValue.push(text);
	}
	return returnValue;
}

//valid commands
const publicCommands = ["help", "trist", "nut", "openPM", //various stuff
			"magic8ball", "fish", "picOfTheDay", //argumentless
			"getPicOnCords", "spell", "sitat", "AO"]; //argumented
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "test"];
const helpList = ["Displays this list.", "Displays the creator's mood.", "Noko shit daniel ordna.", 
		  "Opens a private messaging chat with this bot.", "Use the command followed by a question and the ball anweres", 
		  "Get spell info(capital letters)", "Get a quote from Immy, and sometimes other people(write their name)", 
		  "Roll a d20, and on a nat 20 you get a phrase which triggers a response from the bot.", 
		  "Use the animate object spell, arguments: Armor_Class Level_Cast_At", 
		  "Get Nasa's daily image, and a decription explaining it"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;

//communist constants
const comList = ["vi", "oss", "vår", "våre", "vårt"];
const comValues = [["eg", "jeg", "du", "han", "ho"], ["me", "meg", "deg", "seg"], 
		   ["min", "din", "hans", "hennes"], ["mine", "dine"], ["mitt", "ditt"]];

//valid names for the sitat command
const validNames = [];
runSQL("SELECT DISTINCT navn FROM sitat").then(returned => {
	returned.forEach(element => {
		validNames.push(element.navn);
	});
});

//The main thing
client.on('message', message => {
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
					if(publicCommands.includes(command[1])){
						message.reply("The "+command[1]+" command has the following description: "+
							     helpList[publicCommands.indexOf(command[1])]);
					}else{
						message.reply("All public commands: "+publicCommands.join(", ")+"\n"+
							     "Write !help [a command] to see that command's description.");
					}
					break;
				case "trist":
					message.reply('Jakob har det bra, takk som spør :smile:');
					break;
				case "nut":
					message.channel.send(":weary: :ok_hand: :sweat_drops:");
					break;
				case "openPM":
					if(command[1] === undefined){
						tellMe(message.author.username+" has opened a PM");
						message.author.send("Hello there");
					}else{
						client.fetchUser(command[1]).then(user => {
							user.send("Hi there!\nThis message was sent to you by "+message.author.username)
						});
					}
					break;
				//argumentless
				case "magic8ball":
					runSQL("SELECT ball FROM ball ORDER BY RAND() LIMIT 1;").then(returned => {
						message.reply(returned[0].ball);
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
				case "picOfTheDay":
					sendhttpsRequest({host: "NasaAPIdimasV1.p.rapidapi.com",
							  path: "/getPictureOfTheDay", method: "POST",
							  headers: {"X-RapidAPI-Key": "bb17e77c02mshcfda7d104f3aa6ep13011djsn3ade2fc0025b",
							  "Content-Type": "application/x-www-form-urlencoded"}}).then(returned => {
						message.reply(returned.contextWrites.to.title+"\n"+
							      returned.contextWrites.to.explanation+"\n"+
							      returned.contextWrites.to.url);
					});
					break;
				//argumented
				case "getPicOnCords":
					sendhttpsRequest({host: "earth-imagery-api.herokuapp.com", 
							  path: "/earth/imagery/?lat="+command[1]+"&lon="+command[2], 
							  method: "GET"}).then(returned => {
						message.reply(returned["url"]);
					}).catch(e => {
						console.log("Error with getPicOnCords: "+e);
					});
					break;
				case "spell":
					getSpellThings(command.slice(1).join("+")).then(returned => 
						splitText(returned).forEach(function(item){
							message.reply(item);
						})
					);
					break;
				case "sitat":
					if(validNames.includes(command[1])){
						runSQL("SELECT sitat, navn FROM sitat WHERE navn='"+command[1]+
						"' ORDER BY RAND() LIMIT 1;").then(function(returned){
							message.reply(returned[0].navn+": "+returned[0].sitat);
						});
					}else if(command[1] === "navn"){
						runSQL("SELECT DISTINCT navn FROM sitat;").then(function(returned){
							let names = [];
							returned.forEach(function(name){
								names.push(name.navn);
							})
							message.reply("Vi har sitat fra: "+names.join(", "));
						});
					}else if(command[1]){
						 message.reply("Couldn't find that person (please use capital letters)");
					}else{
						runSQL("SELECT sitat, navn FROM sitat ORDER BY RAND() LIMIT 1;")
						.then(function(returned){
							message.reply(returned[0].navn+": "+returned[0].sitat);
						});
					}
					break;
				case "AO":
					let responce = "";
					let sumDmg = 0;
					let lvl = 5
					if(command[2]<5){
						message.reply("You have to cast it at at least fifth level");
					}else if(5<=command[2]){
						lvl = command[2];
					}
					for(let i = 0; i < 10+2*(lvl-5); i++){
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
					recording = false;
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
					/*message.channel.fetchMessages({before: message.id, limit: 1})
						.then(messages => message.reply((messages.array()[0].content)))
						.catch(messages => console.log("shit"));
					*/
					//coordinate=50.37,26.56
					break;
			}
		}
	}else if(message.guild === null && message.author.id !== botId && message.author.id !== myId){
		tellMe(message.author+" just wrote this to me:\n"+message.content);
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
					splitText(returned[i].responses).forEach(function(item){
						message.reply(item);
					});
				}
			});
		}catch(e){
			console.log(e);
		}
		
		//phrases from communism. constants: comList comValues
		let words = splitSymbols(message.content);
		for(let i = 0; i < words.length; i++){
			for(let a = 0; a < comValues.length; a++){
				if(comValues[a].includes(words[i].toLowerCase())){
					words[i] = "**"+comList[a]+"**";
				}
			}
		}
		words = words.join("");
		if(message.content !== words){
			message.reply("Did you mean:\n"+words);
		}
	}
	
	//recording code
	if(recording && !message.author.bot && message !== undefined){
		tellMe(message.author.username+": "+message.content);
	}
});
/*
client.on("voiceStateUpdate", (oldMember, newMember) => {
	if(newMember.id !== botId){
		if(oldMember.voiceChannel === undefined && newMember.voiceChannel !== undefined && 
			newMember.voiceChannel.guild.id === "545557823438848001"){
			//tellMe("User "+newMember.nickname+" has joined "+newMember.voiceChannel.name+" on your classroom");
			newMember.voiceChannel.join().then(connection => {
				client.setTimeout(function(){
					connection.disconnect();
				}, 5000);
			}).catch(function(e){
				console.log(e);
			});
			
		}else if(newMember.voiceChannel === undefined && oldMember.voiceChannel !== undefined && 
			oldMember.voiceChannel.guild.id === "545557823438848001"){
			//tellMe("User "+newMember.nickname+" has left "+oldMember.voiceChannel.name+" on your classroom");
		}
	}
});*/

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
