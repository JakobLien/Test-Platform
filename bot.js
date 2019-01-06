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

function getSpellData(spellName){
    http.get('http://www.dnd5eapi.co/api/spells/?name='+spellName, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try{
                spellLink = (JSON.parse(data))["results"][0]["url"];
                console.log("Now its a link. "+typeof(spellLink)+": "+spellLink);
                
                http.get(spellLink, (resp) => {
                    let data = '';
                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        console.log(typeof(data), data);
                        giveSpellData(JSON.parse(data));
                    });
                }).on("error", (err) => {
                    console.log("Error(2): " + err.message);
                });
            }catch(err){
                last_message_object.reply("That spell was not found. The error message goes: "+err);
            }
        });
        }).on("error", (err) => {
            console.log("Error(1): " + err.message);
        });
}


function giveSpellData(data){
    for(var i = 0; i<data["desc"].length; i++){
        last_message_object.reply(data["desc"][i]);
    }
}

var i = false;
client.on('message', message => {
    if(message.content[0] === "!"){
        command = message.content.slice(1).split(" ");
        keyword = command[0];
        switch(keyword){
            case 'trist':
                message.reply('Jakob er trist!');
                break;
            case "turn_on":
                message.reply("turned on");
                i = true;
                break;
            case "turn_off":
                message.reply("turned off");
                i = false;
                break;
            case "print":
                message.reply(i);
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
        }
    }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
