//add to guild: https://discordapp.com/oauth2/authorize?&client_id=530439718823788544&scope=bot&permissions=8
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
	tellMe("I'm back");
});

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
function sendhttpRequest(link){
	return new Promise(function(resolve, reject){
		http.get(link, (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				resolve(data);
				
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}

function getSpellThings(spellName){
	return new Promise(function(resolve, reject){
		sendhttpRequest('http://www.dnd5eapi.co/api/spells/?name='+spellName).then(returned =>
			sendhttpRequest(JSON.parse(returned)["results"][0]["url"]).then(returned2 => 
				resolve(formatSpellData(JSON.parse(returned2)))
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

//functions to start and stop "working"
function startWorking(message){
	message.channel.send("Working").then(workmsg => {
		let interval = client.setInterval(function(){
			switch (workmsg.content){
				case "Working":
					workmsg.edit("Working.");
					break;
				case "Working.":
					workmsg.edit("Working..");
					break;
				case "Working..":
					workmsg.edit("Working...");
					break;
				case "Working...":
					workmsg.edit("Working");
					break;
			}
		}, 2000);
		client.setTimeout(function(){discord.clearInterval(interval)}, 200000);
	});
}

function stopWorking(){
	
}

//valid commands
const publicCommands = ["help", "trist", "nut", "openPM", //various stuff
			"spell", "immy", "fish", "AO"]; //specific stuff
const privateCommands = ["me", "us", "start", "stop", "suicide", "runSQL", "test"];

//controll variables
const myId = "265570029792133129";
const botId = "530439718823788544";
var iDecide = false;
var recording = false;

//communist constants
const comList = ["vi", "oss", "vår", "våre", "vårt"];
const comValues = [["eg", "jeg", "du", "han", "ho"], ["me", "meg", "deg", "seg"], 
		   ["min", "din", "hans", "hennes"], ["mine", "dine"], ["mitt", "ditt"]];

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
					message.reply("All public commands: "+publicCommands.join(", "));
					break;
				case "trist":
					message.reply('Jakob er trist!');
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
				//specific stuff
				case "spell":
					getSpellThings(command.slice(1).join("+")).then(returned => 
						splitText(returned).forEach(function(item){
							message.reply(item);
						})
					);
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
					if(command[2]<5){message.reply("You have to cast it at at least fifth level");break;}
					for(let i = 0; i < 10+2*(command[2]-5); i++){
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
					/*message.channel.fetchMessages({before: message.id, limit: 1})
						.then(messages => message.reply((messages.array()[0].content)))
						.catch(messages => console.log("shit"));
					*/
					
					/*console.log(splitSymbols(message.content));*/
					startWorking(message);
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

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
