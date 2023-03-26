const TelegramBot = require("node-telegram-bot-api");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// replace the value below with the Telegram token you receive from @BotFather
const token = "5762320147:AAG4Jo-x4txQbu5NLQC1rqaR1iz4d7z0BBo";

// replace the value below with the API endpoint for your GPT-3 instance
// const gptEndpoint = "https://api.openai.com/v1/engines/davinci-002/completions";
const gptEndpoint =
  "https://api.openai.com/v1/engines/text-davinci-003/completions";

// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, { polling: true });
const bot = new TelegramBot(token, {
  webHook: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
  },
});
bot.setWebHook(
  "https://5ecc-2401-4900-1f2d-4556-ec38-afcc-fc59-88f1.in.ngrok.io/bot5762320147:AAG4Jo-x4txQbu5NLQC1rqaR1iz4d7z0BBo"
);

// // Listen for any kind of message
// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const message = msg.text;
//   if (message) {
//     const prompt = message.trim();
//     const response = await generateResponse(prompt);
//     bot.sendMessage(chatId, response);
//   }
// });

// // replace the value below with your OpenAI API key
// const openaiApiKey = "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";

// async function generateResponse(prompt) {
//   const requestBody = {
//     prompt: prompt,
//     max_tokens: 200,
//     temperature: 0.7,
//     // model: "text-davinci-002", // for GPT-3.5 Turbo
//   };

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${openaiApiKey}`,
//   };
//   try {
//     const response = await fetch(gptEndpoint, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(requestBody),
//     });
//     const json = await response.json();
//     if (json.error) {
//       throw new Error(json.error.message);
//     }
//     return json.choices[0].text;
//   } catch (error) {
//     console.log(error);
//     return "Oops! Something went wrong. Please try again later.";
//   }
// }

const fs = require("fs");

// Load API key from file or ask user for it
let openaiApiKey;
if (fs.existsSync("./openaiapikey.txt")) {
  openaiApiKey = fs.readFileSync("./openaiapikey.txt").toString().trim();
} else {
  console.log("Please enter your OpenAI API key:");
  process.stdin.once("data", (data) => {
    openaiApiKey = data.toString().trim();
    fs.writeFileSync("./openaiapikey.txt", openaiApiKey);
    console.log("API key saved to file.");
  });
  process.stdin.resume();
}

async function startBot() {
  console.log("Enter your OpenAI API key:");
  const apiKey = await getUserInput();

  // ...

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    const response = await generateResponse(message, apiKey);
    bot.sendMessage(chatId, response);
  });

  // ...
}

// let openaiApiKey = null;

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    "Welcome to OpenAI GPT-3 chatbot! Please enter your OpenAI API key:"
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (!openaiApiKey) {
    openaiApiKey = messageText;
    await bot.sendMessage(chatId, "OpenAI API key saved successfully.");
  } else {
    const response = await generateResponse(messageText);
    await bot.sendMessage(chatId, response);
  }
});

async function generateResponse(prompt) {
  const gptEndpoint =
    "https://api.openai.com/v1/engines/text-davinci-003/completions";

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

// Handler for /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hello! I'm a chat bot powered by OpenAI GPT-3. Send me a message and I'll respond to it."
  );
});

// Handler for text messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text.toLowerCase() === "api key") {
    bot.sendMessage(chatId, "Please enter your new OpenAI API key:");
    bot.once("message", (newApiKeyMsg) => {
      const newApiKey = newApiKeyMsg.text.trim();
      fs.writeFileSync("./openaiapikey.txt", newApiKey);
      openaiApiKey = newApiKey;
      bot.sendMessage(chatId, "API key updated successfully!");
    });
  } else {
    const prompt = msg.text.trim();
    const response = await generateResponse(prompt);
    bot.sendMessage(chatId, response);
  }
});

console.log("Bot is running...");
