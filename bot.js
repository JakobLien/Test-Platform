//The good stuff: 
//send message: message.channel.send("");
//reply to command message.reply("");
//access a variable

const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');

client.on('ready', () => {
    console.log('I am ready!');
});

function getSpellData(number){
    https.get('http://dnd5eapi.co/api/spells/'+number, (resp) => {
        let data = '';
        
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            return JSON.parse(data);
        });
        
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    
}

var i = false;
client.on('message', message => {
    if (message.content === '!trist') {
        message.reply('Jakob er trist!');
    }else if(message.content === "!turn_on"){
        message.reply("turned on");
        i = true;
    }else if(message.content === "!turn_off"){
        message.reply("turned off");
        i = false;
    }else if(message.content === "!print"){
        message.reply(i);
    }else if(message.content === "!spell"){
        console.log("Im here now")
        message.channel.send("did this get through?")
    }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
