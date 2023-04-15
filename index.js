require('dotenv/config');
const {Client, IntentsBitField, ActivityType, AttachmentBuilder} = require('discord.js');
const {Configuration, OpenAIApi} = require('openai');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

let status = [
    {
        type: ActivityType.Watching,
        name: 'J\'apprend des choses sur le web',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
        name: 'GPT Discord Bot',
        type: 4,
        details: 'Si vous avez besoin d\'aide, tapez \'aide\' dans #chat-gpt'
    },
    {
        "name": "Rocket League",
        "type": 0,
        "application_id": "379286085710381999",
        "state": "In a Match",
        "details": "Ranked Duos: 2-1",
        "timestamps": {
            "start": 15112000660000
        },
        "party": {
            "id": "9dd6594e-81b3-49f6-a6b5-a679e6a060d3",
            "size": [2, 2]
        },
        "assets": {
            "large_image": "351371005538729000",
            "large_text": "DFH Stadium",
            "small_image": "351371005538729111",
            "small_text": "Silver III"
        },
        "secrets": {
            "join": "025ed05c71f639de8bfaa0d679d7c94b2fdce12f",
            "spectate": "e7eb30d2ee025ed05c71ea495f770b76454ee4e0",
            "match": "4b2fdce12f639de8bfa7e3591b71a0d679d7c93f"
        }
    }
]

client.on('ready', () => {
    console.log('The bot is online!');

    setInterval(() => {
        let random = Math.round(Math.random() * (status.length - 1));
        client.user.setPresence({activities: [{name: 'Faites \'!!\' pour parler avec moi'}], status: 'online'});
    }, 5000);
});

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    let conversationLog = [{role: 'system', content: 'You are a friendly chatbot.'}];

    try {
        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({limit: 15});
        prevMessages.reverse();

        if (message.content.startsWith("!!")) {
            prevMessages.forEach((msg) => {
                if (msg.author.id !== client.user.id && message.author.bot) return;
                if (msg.author.id !== message.author.id) return;

                conversationLog.push({
                    role: 'user',
                    content: msg.content.slice(2),
                });
            });

            const result = await openai
                .createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: conversationLog,
                    // max_tokens: 256, // limit token usage
                })
                .catch((error) => {
                    console.log(`OPENAI ERR: ${error}`);
                });
            const file = new AttachmentBuilder('assets/img/download.png');
            const embedQuestion = {
                color: 0x78A89C,
                title: 'Votre demande',
                description: message.content.slice(2),
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL(),
                },
            };
            const embedAnswer = {
                color: 0x78A89C,
                title: 'Réponse de Discord GPT',
                description: result.data.choices[0].message.content,
                author: {
                    name: 'ESGI Discord GPT',
                    icon_url: 'attachment://download.png',
                },
                timestamp: new Date().toISOString(),
            };

            await message.reply({embeds: [embedQuestion, embedAnswer], files: [file]});
        }

    } catch (error) {
        console.log(`ERR: ${error}`);
    }

    otherMsg = message.content
    if (otherMsg.toLowerCase().replace(" ", "") === 'help' || otherMsg.toLowerCase().replace(" ", "") === 'aide') {
        message.reply("Je suis un bot lié a ChatGPT. \nJe suis conversationnel, ce qui veux dire que je prend en compte les derniers message envoyer par la même personne. \nPour parler avec moi, il suffit de commancer sa phrase par \`!!\` dans ce channel.")
    }

});

client.login(process.env.TOKEN);