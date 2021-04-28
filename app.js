const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { exit } = require('process');
const TAG = "[PRIVEW_SYSTEM] "
const chalk = require('chalk');
const CONFIG = JSON.parse(fs.readFileSync('res/config.json','utf-8'));
const axios = require("axios");
const cheerio = require("cheerio");

const LoL = {};
 
LoL.getDocument = async (url) => {
    try{
        return await axios.get(url);
    } catch (e){
        errorLog(e);
    }
}

const AuthManager = {};

AuthManager.check  = (id) => {
    let data = JSON.parse(fs.readFileSync('res/data.json'));
    return data.userData.filter(i => i["userId"] === id).length > 0;
}

AuthManager.register = (id) => {
    let data = JSON.parse(fs.readFileSync('res/data.json'));
    data.userData.push({
        "userId": id,
        "permission": 'default'
    });
    fs.writeFileSync('res/data.json',JSON.stringify(data,null,4))
}
AuthManager.savePin = (pin) => {
    let data = JSON.parse(fs.readFileSync('res/data.json',{'encoding':'utf-8'}));
    data["auth-key"] = pin;
    fs.writeFileSync('res/data.json',JSON.stringify(data,null,4))
}

AuthManager.readPin = () => {
    let data = JSON.parse(fs.readFileSync('res/data.json'))
    return data["auth-key"];
}

AuthManager.giveAdmin = (id) => {
    let data = JSON.parse(fs.readFileSync('res/data.json'));
    data.userData.map(i => {
        if(i["userId"] === id) i["permission"] = "admin"
    })
    fs.writeFileSync('res/data.json',JSON.stringify(data,null,4))
}

AuthManager.checkAdmin = (id) => {
    let data = JSON.parse(fs.readFileSync('res/data.json'));
    data.userData.map((v) => {
        if(v["userId"] === id) {
            if(v["permission"] === "admin") return true;
        }
    })
}

const logText = (text) =>  {
    console.log(chalk.cyan(`${TAG}${text}`));
    fs.appendFile('logs.log',`\n[${new Date().toLocaleString()}] ${TAG}${text}`,'utf-8',(err) => {
        if(err) throw err;
    });
}
const errorLog = (text) => {
    console.log(chalk.red(`${TAG}${text}`));
    fs.appendFile('logs.log',`\n[${new Date().toLocaleString()}] ${TAG}${text}`,'utf-8',(err) => {
        if(err) throw err;
    });
}

client.once('ready', () => {
    try {
        if(!fs.existsSync('logs.log')) fs.writeFile('logs.log','---------------------Log---------------------','utf-8',function (err){ exit() });
        if (fs.existsSync('res/config.json')) {
            logText('성공적으로 로드되었습니다.');
            logText(`${client.user.tag}으로 로그인됨.`);
            client.user.setActivity('공부', { type: 'PLAYING' });
        } else {
            errorLog('Configuration 파일을 찾을수 없습니다.');
            errorLog('시스템을 종료합니다.');
            exit();
        }
      } catch(err) {
        errorLog('file not exsits');
    }
});

client.on('message', async msg => {
    
    if (!msg.content.startsWith('p')) return;

    const args = msg.content.split(" ");
    const cmd = msg.content.slice(1).split(" ")[0];

    switch (cmd) {
        case 'id':
            msg.channel.send(msg.author.id);
            break;
        case '가입확인':
            if(AuthManager.check(msg.author.id)) {
                msg.channel.send("가입 확인됨.");
            } else { 
                msg.channel.send("가입되지 않은 사용자입니다. p가입 을 통해 가입해주세요.");
            }
            logText(`${msg.author.id}님이 가입확인 명령어를 사용하셨습니다. Content: ${msg.content}`);
            break;
        case '가입':
            if(!AuthManager.check(msg.author.id)) {
                AuthManager.register(msg.author.id);
                msg.channel.send(`${msg.author.username} 님의 가입이 완료되었습니다.\nid : ${msg.author.id}`);
            } else { 
                msg.channel.send("이미 가입된 유저입니다 에러코드 : 0x22");
            }
            logText(`${msg.author.id}님이 가입 명령어를 사용하셨습니다. Content: ${msg.content}`);
            break;
        case '롤아이콘':
            const iconNum = args[1];
            const messageEmbed = new Discord.MessageEmbed()
            await LoL.getDocument(`http://ddragon.leagueoflegends.com/cdn/11.8.1/img/profileicon/${iconNum}.png`)
                .then(response => {
                    if(response.status === 403){
                        messageEmbed
                            .setTitle(`id ${iconNum}의 아이콘은 없습니다.`)
                            .setDescription(`status: ${response.status}`)
                    } else {
                        messageEmbed
                            .setTitle(`id ${iconNum}의 아이콘`)
                            .setImage(`http://ddragon.leagueoflegends.com/cdn/11.8.1/img/profileicon/${iconNum}.png`)
                    }
                })
                .catch(e => {
                    errorLog(e);
                    messageEmbed
                            .setTitle(`id ${iconNum}번의 아이콘은 없습니다.`)
                            .setDescription(`status: unknown`)
                });
            msg.channel.send(messageEmbed);
            break;
        case '지급':
            const AuthPin = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            logText(`관리자 패스워드 지급됨 : ${AuthPin}`);
            AuthManager.savePin(AuthPin);
            msg.channel.send(`관리자 인증용 핀을 생성하였습니다. p인증 <pin>을 통해 관리자를 얻으십시오.`);
            break;
        case '인증':
            const inputPin = args[1];
            if(AuthManager.readPin() === inputPin) {
                msg.channel.send(`환영합니다 관리자 ${msg.author}님`)
                AuthManager.giveAdmin(msg.author.id)
            }
            break;
        case 'Eval':
            if(AuthManager.checkAdmin(msg.author.id)){
                msg.channel.send(`Welcome Adminstrator ${msg.author}`);
                try {
                    const evalEmbed = new Discord.MessageEmbed()
                        .setColor('11cbe0')
                        .setURL('https://HexaL0707.github.io')
                        .setAuthor('EVALUATION RESULT')
                        .setThumbnail('https://cdn.discordapp.com/attachments/751778281472131114/755785780210958417/20200916_224232.jpg')
                        .setTitle(':white_check_mark: 실행 성공')
                        .setDescription(eval(String(msg.content).slice(6)))

                    msg.channel.send(evalEmbed);
                } catch (e) {
                    errorLog(e);
                    const errorEmbed = new Discord.MessageEmbed()
                        .setColor('11cbe0')
                        .setURL('https://HexaL0707.github.io')
                        .setAuthor('EVALUATION RESULT')
                        .setThumbnail('https://cdn.discordapp.com/attachments/751778281472131114/754725301270872114/20200914_002838.jpg')
                        .setTitle(':warning: 예외 감지')
                        .setDescription(JSON.stringify(JSON.parse(e),null,4))

                    msg.channel.send(errorEmbed);
                }
            } else {
                msg.channel.send("넌 관리자가 아니야")
            }
            break;
    }
})

client.login(CONFIG["APP-TOKEN"]);