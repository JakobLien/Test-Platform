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

function getSpellData(number){
    http.get('http://www.dnd5eapi.co/api/spells/'+number, (resp) => {
        let data = '';
        
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(data);
            return data;
        });
        
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    
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
            case "spell":
                message.reply(getSpellData(Number(command[1])));
                break;
        }
    }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
