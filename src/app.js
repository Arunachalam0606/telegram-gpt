const TelegramBot = require("node-telegram-bot-api");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// replace the value below with the Telegram token you receive from @BotFather
const token = "5762320147:AAG4Jo-x4txQbu5NLQC1rqaR1iz4d7z0BBo";

// replace the value below with the API endpoint for your GPT-3 instance
// const gptEndpoint = "https://api.openai.com/v1/engines/davinci-002/completions";
const gptEndpoint =
  "https://api.openai.com/v1/engines/text-davinci-003/completions";

const bot = new TelegramBot(token, {
  webHook: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
  },
});

bot.setWebHook(
  "https://9b36-2401-4900-1f2d-aa68-bdb2-1d2d-f41a-b9ba.in.ngrok.io/bot5762320147:AAG4Jo-x4txQbu5NLQC1rqaR1iz4d7z0BBo"
);

// Load API key from file or ask user for it
const fs = require("fs");
// Load API key from file or ask user for it
let openaiApiKey;
if (fs.existsSync("./openaiapikey.txt")) {
  openaiApiKey = fs.readFileSync("./openaiapikey.txt").toString().trim();
} else {
  console.log("API key not found. Please set your OpenAI API key now:");
  bot.on("message", async (msg) => {
    if (msg.text.trim().toLowerCase() === "set api key") {
      bot.sendMessage(msg.chat.id, "Please enter your OpenAI API key:");
      bot.once("message", (apiKeyMsg) => {
        openaiApiKey = apiKeyMsg.text.trim();
        fs.writeFileSync("./openaiapikey.txt", openaiApiKey);
        bot.sendMessage(
          msg.chat.id,
          "API key saved. You can now start using the bot!"
        );
      });
    }
  });
}

async function startBot() {
  console.log("Bot is running...");

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    const response = await generateResponse(message);
    bot.sendMessage(chatId, response);
  });

  // Handler for /start command
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "Hello! I'm a chat bot powered by OpenAI GPT-3. Send me a message and I'll respond to it."
    );
  });
}

async function generateResponse(prompt) {
  if (!openaiApiKey) {
    return "API key not set. Please set your OpenAI API key by sending the message 'set api key' to the bot.";
  }

  const requestBody = {
    prompt: prompt,
    max_tokens: 200,
    temperature: 0.7,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiApiKey}`,
  };
  try {
    const response = await fetch(gptEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.choices[0].text;
  } catch (error) {
    console.log(error);
    return "Oops! Something went wrong. Please try again later.";
  }
}

startBot();
