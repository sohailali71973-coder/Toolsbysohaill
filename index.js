const BOT_TOKEN = "8810008815:AAHZpZ7n5i4-6DxEnlGqV8SwNR-15VHG6Vc";
const BOT_NAME = "TOOLs BOT by sohail";
const INSTAGRAM_LINK = "https://instagram.com/clip2editz"; 
const API_KEY = "MY_TEST_KEY_123";

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

// Helper function to modify JSON fields
function customizeOwnerAndKey(data) {
  if (data && typeof data === 'object') {
    data.owner = "@sohailcyberexpert";
    if (data.metadata && typeof data.metadata === 'object') {
      data.metadata.key_owner = "sohaildaddy";
    }
  }
  return data;
}

async function handleRequest(request) {
  if (request.method === "POST") {
    try {
      const update = await request.json();

      // 1. Handle Inline Buttons
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (data === "verify_access") {
          const mainMenu = `✅ **Verification Successful!**\n\nCommands use karein:\n\n1️⃣ **Mobile:** \`/num <10-digit number>\`\n2️⃣ **Vehicle:** \`/vehicle <Vehicle No.>\`\n3️⃣ **UPI:** \`/upi <UPI ID>\`\n4️⃣ **Pincode:** \`/pin <6-digit pincode>\` \n5️⃣ **Aadhaar:** \`/aadhar <12-digit number>\``;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📱 Mobile Lookup", callback_data: "btn_num" }, { text: "🚗 Vehicle Info", callback_data: "btn_vehicle" }],
              [{ text: "💳 UPI Details", callback_data: "btn_upi" }, { text: "📍 Pincode Info", callback_data: "btn_pin" }],
              [{ text: "🆔 Aadhaar Info", callback_data: "btn_aadhar" }]
            ]
          };
          await sendInlineKeyboard(chatId, mainMenu, keyboard);
          return new Response("OK", { status: 200 });
        }

        if (data === "btn_num") await sendMessage(chatId, "📲 **Mobile Search:**\nSend: `/num 9876543210`");
        if (data === "btn_vehicle") await sendMessage(chatId, "🚗 **Vehicle Search:**\nSend: `/vehicle RJ14CV0002`");
        if (data === "btn_upi") await sendMessage(chatId, "💳 **UPI Search:**\nSend: `/upi example@ybl`");
        if (data === "btn_pin") await sendMessage(chatId, "📍 **Pincode Search:**\nSend: `/pin 411001`");
        if (data === "btn_aadhar") await sendMessage(chatId, "🆔 **Aadhaar Search:**\nSend: `/aadhar 123456789012`");
        
        return new Response("OK", { status: 200 });
      }

      // 2. Handle Text Messages
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();

        if (text === "/start") {
          const welcomeMsg = `👋 **Welcome to ${BOT_NAME}!**\n\n⚠️ **Access Gate:** Pehle Instagram page follow karein aur **Verify** par click karein.`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📸 Follow on Instagram", url: INSTAGRAM_LINK }],
              [{ text: "✅ Verify Follow", callback_data: "verify_access" }]
            ]
          };
          await sendInlineKeyboard(chatId, welcomeMsg, keyboard);
          return new Response("OK", { status: 200 });
        }

        // Mobile Lookup
        if (text.startsWith("/num")) {
          const query = text.split(/\s+/)[1];
          if (!query || query.length !== 10 || isNaN(query)) {
            await sendMessage(chatId, "⚠️ **Usage:** `/num 9876543210` (10-digit number enter karein)");
            return new Response("OK", { status: 200 });
          }

          await sendMessage(chatId, "🔍 *Fetching Mobile Details...*");
          try {
            const res = await fetch(`https://nitin-developer-api-paid.nitinshab43.workers.dev/api?action=num&number=${query}&key=${API_KEY}`);
            let data = await res.json();
            data = customizeOwnerAndKey(data);

            await sendMessage(chatId, `📱 **Number Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
          } catch (e) {
            await sendMessage(chatId, "❌ Server Error or Invalid API Response!");
          }
          return new Response("OK", { status: 200 });
        }

        // Vehicle Info
        if (text.startsWith("/vehicle") || text.startsWith("/vechicle")) {
          const query = text.split(/\s+/)[1];
          if (!query) {
            await sendMessage(chatId, "⚠️ **Usage:** `/vehicle RJ14CV0002`");
            return new Response("OK", { status: 200 });
          }

          await sendMessage(chatId, "🔍 *Fetching Vehicle Details...*");
          try {
            const res = await fetch(`https://nitin-api-free-user-1k-spacial.vercel.app/api?type=vehicle&search=${query}`);
            let data = await res.json();
            data = customizeOwnerAndKey(data);

            await sendMessage(chatId, `🚗 **Vehicle Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
          } catch (e) {
            await sendMessage(chatId, "❌ Server Error!");
          }
          return new Response("OK", { status: 200 });
        }

        // UPI Info
        if (text.startsWith("/upi")) {
          const query = text.split(/\s+/)[1];
          if (!query) {
            await sendMessage(chatId, "⚠️ **Usage:** `/upi example@ybl`");
            return new Response("OK", { status: 200 });
          }

          await sendMessage(chatId, "🔍 *Fetching UPI Details...*");
          try {
            const res = await fetch(`https://nitin-developer-api-paid.nitinshab43.workers.dev/api?action=upiinfo&upi=${encodeURIComponent(query)}&key=${API_KEY}`);
            let data = await res.json();
            data = customizeOwnerAndKey(data);

            await sendMessage(chatId, `💳 **UPI Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
          } catch (e) {
            await sendMessage(chatId, "❌ Server Error!");
          }
          return new Response("OK", { status: 200 });
        }

        // Pincode Info
        if (text.startsWith("/pin") || text.startsWith("/pincode")) {
          const query = text.split(/\s+/)[1];
          if (!query || query.length !== 6 || isNaN(query)) {
            await sendMessage(chatId, "⚠️ **Usage:** `/pin 411001` (6-digit pincode)");
            return new Response("OK", { status: 200 });
          }

          await sendMessage(chatId, "🔍 *Fetching Pincode Details...*");
          try {
            const res = await fetch(`https://nitin-api-free-user-1k-spacial.vercel.app/api?type=pincode&search=${query}`);
            let data = await res.json();
            data = customizeOwnerAndKey(data);

            await sendMessage(chatId, `📍 **Pincode Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
          } catch (e) {
            await sendMessage(chatId, "❌ Server Error!");
          }
          return new Response("OK", { status: 200 });
        }

        // Aadhaar Info
        if (text.startsWith("/aadhar")) {
          const query = text.split(/\s+/)[1];
          if (!query || query.length !== 12 || isNaN(query)) {
            await sendMessage(chatId, "⚠️ **Usage:** `/aadhar 123456789012` (12-digit Aadhaar number enter karein)");
            return new Response("OK", { status: 200 });
          }

          await sendMessage(chatId, "🔍 *Fetching Aadhaar Details...*");
          try {
            const res = await fetch(`https://nitin-developer-api-paid.nitinshab43.workers.dev/api?action=aadhar&aadhar=${query}&key=${API_KEY}`);
            let data = await res.json();
            data = customizeOwnerAndKey(data);

            await sendMessage(chatId, `🆔 **Aadhaar Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
          } catch (e) {
            await sendMessage(chatId, "❌ Server Error or Invalid API Key!");
          }
          return new Response("OK", { status: 200 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return new Response("OK", { status: 200 });
}

// Helper Functions
async function sendMessage(chatId, text) {
  return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" })
  });
}

async function sendInlineKeyboard(chatId, text, keyboard) {
  return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown", reply_markup: keyboard })
  });
}
