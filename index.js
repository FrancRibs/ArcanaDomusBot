const { Client, GatewayIntentBits } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");

// ===============================
// REGISTAR A FONTE MONT SERRAT
// ===============================
registerFont("./fonts/Montserrat-ExtraBoldItalic.ttf", { family: "Montserrat" });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Discord.js v15: ready → clientReady
client.once("clientReady", () => {
    console.log("Ready!");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.reference) return;

    const replied = await message.channel.messages.fetch(message.reference.messageId);

    const avatarURL = replied.author.displayAvatarURL({ extension: "png", size: 512 });
    const avatarImage = await loadImage(avatarURL);

    const canvas = createCanvas(560, 280);
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 22);
    ctx.clip();

    const imgW = avatarImage.width;
    const imgH = avatarImage.height;

    const scale = Math.max(canvas.width / imgW, canvas.height / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const x = (canvas.width - drawW) / 2;
    const y = (canvas.height - drawH) / 2;

    ctx.drawImage(avatarImage, x, y, drawW, drawH);

    ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.1
    );

    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.65)");

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(3, 3, canvas.width - 6, canvas.height - 6, 22);
    ctx.stroke();

    const rawQuote = replied.content;
    const quoteText = `"${rawQuote}"`;

    ctx.font = "28px Montserrat";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    const maxWidth = canvas.width - 60;
    const lineHeight = 34;

    function wrapText(text) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const totalHeight = lines.length * lineHeight;
        let y = (canvas.height / 2) - (totalHeight / 2);

        for (let i = 0; i < lines.length; i++) {
            const metrics = ctx.measureText(lines[i]);
            const x = (canvas.width - metrics.width) / 2;

            ctx.strokeText(lines[i], x, y);
            ctx.fillText(lines[i], x, y);

            y += lineHeight;
        }
    }

    wrapText(quoteText);

    // ===============================
    // ASSINATURA — SÓ USERNAME
    // ===============================

    const username = replied.author.username; // <-- só isto

    const signatureText = `- ${username} -`;

    ctx.font = "18px Montserrat"; // tamanho perfeito
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    const sigMetrics = ctx.measureText(signatureText);
    const sigX = canvas.width - sigMetrics.width - 25;
    const sigY = canvas.height - 25;

    ctx.strokeText(signatureText, sigX, sigY);
    ctx.fillText(signatureText, sigX, sigY);

    const buffer = canvas.toBuffer();
    message.channel.send({ files: [{ attachment: buffer, name: "quote.png" }] });
});



client.login(process.env.TOKEN);


