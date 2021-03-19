const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { exit } = require('process');
const TAG = "[PRIVEW_SYSTEM] "
const chalk = require('chalk');
const CONFIG = JSON.parse(fs.readFileSync('res/config.json','utf-8'));

const logText = (text) =>  {
    console.log(chalk.cyan(`${TAG}${text}`));
    fs.appendFile('log.txt',`\n[${new Date().toLocaleString()}] ${TAG}${text}`,'utf-8',(err) => {
        if(err) throw err;
    });
}
const errorLog = (text) => {
    console.log(chalk.red(`${TAG}${text}`));
    fs.appendFile('log.txt',`\n[${new Date().toLocaleString()}] ${TAG}${text}`,'utf-8',(err) => {
        if(err) throw err;
    });
}

client.once('ready', () => {
    try {
        if(!fs.existsSync('log.txt')) fs.writeFile('log.txt','---------------------Log---------------------','utf-8',function (err){ exit() });
        if (fs.existsSync('res/config.json')) {
            logText('성공적으로 로드되었습니다.');
            logText(`${client.user.tag}으로 로그인됨.`);
        } else {
            errorLog('Configuration 파일을 찾을수 없습니다.');
            errorLog('시스템을 종료합니다.');
            exit();
        }
      } catch(err) {
        console.log('file not exsits')
    }
});

client.on('message', async msg => {
    if (!msg.content.startsWith('..')) return;

    const args = msg.content.split(" ");
    const cmd = msg.content.slice(2).split(" ")[0];

    try{
        switch (cmd) {
            case 'id':
                msg.channel.send(msg.author.id);
                break;
        }
    } catch(e) {
        errorLog(e);
    }
})

client.login(CONFIG["APP-TOKEN"]);