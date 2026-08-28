const BOT_TOKEN = "8810008815:AAHZpZ7n5i4-6DxEnlGqV8SwNR-15VHG6Vc";
const ADMIN_ID = 7394600693; // Your Admin Telegram ID

// Deep Customizer to replace branding strings globally
function deepCustomizer(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/FizzaGirl/gi, 'sohaildaddy')
              .replace(/@FizzaGirl/gi, '@sohailcyberexpert');
  }
  if (Array.isArray(obj)) {
    return obj.map(deepCustomizer);
  }
  if (typeof obj === 'object' && obj !== null) {
    const customized = {};
    for (const key in obj) {
      customized[key] = deepCustomizer(obj[key]);
    }
    return customized;
  }
  return obj;
}

// Helper function to send Telegram messages
async function sendMessage(chatId, text) {
  const customizedText = deepCustomizer(text);
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: customizedText,
      parse_mode: "Markdown"
    })
  });
}

// Database helper functions using Cloudflare BOT_DB KV
async function getUser(env, userId) {
  const data = await env.BOT_DB.get(`user_${userId}`, { type: 'json' });
  return data || { balance: 0, referredBy: null };
}

async function saveUser(env, userId, userData) {
  await env.BOT_DB.put(`user_${userId}`, JSON.stringify(userData));
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("OK");
    }

    try {
      const update = await request.json();
      const message = update.message;

      if (!message || !message.text) {
        return new Response("OK");
      }

      const chatId = message.chat.id;
      const userId = message.from.id;
      const text = message.text.trim();

      let user = await getUser(env, userId);

      // Handle /start and Referrals (/start <referrer_id>)
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts.length > 1 && !user.referredBy && parts[1] != userId) {
          const referrerId = parts[1];
          let referrer = await getUser(env, referrerId);
          referrer.balance += 5; // Reward 5 credits to referrer
          await saveUser(env, referrerId, referrer);

          user.referredBy = referrerId;
          await saveUser(env, userId, user);

          await sendMessage(chatId, `🎁 You joined via referral! Referrer (${referrerId}) received 5 credits.`);
        }

        const responseMsg = `Welcome to @sohailcyberexpert Bot!\n\n` +
          `👤 *Your Profile*\n` +
          `• User ID: \`${userId}\`\n` +
          `• Credits: *${user.balance}*\n\n` +
          `🔗 *Referral Link:*\n` +
          `https://t.me/toolsbysohaill_bot?start=${userId}\n\n` +
          `📌 *Available Commands:*\n` +
          `• /profile - Check your balance\n` +
          `• /redeem <code> - Redeem gift code`;

        await sendMessage(chatId, responseMsg);
        return new Response("OK");
      }

      // Profile Command
      if (text === "/profile" || text === "/balance") {
        await sendMessage(chatId, `👤 *Profile Status:*\n• User ID: \`${userId}\`\n• Balance: *${user.balance} Credits*`);
        return new Response("OK");
      }

      // Redeem Command (/redeem <code>)
      if (text.startsWith("/redeem")) {
        const code = text.split(" ")[1];
        if (!code) {
          await sendMessage(chatId, "⚠️ *Usage:* `/redeem <code>`");
          return new Response("OK");
        }

        const codeVal = await env.BOT_DB.get(`code_${code}`);
        if (!codeVal) {
          await sendMessage(chatId, "❌ *Invalid or already used code.*");
          return new Response("OK");
        }

        const creditsToAdd = parseInt(codeVal);
        user.balance += creditsToAdd;
        await saveUser(env, userId, user);
        await env.BOT_DB.delete(`code_${code}`);

        await sendMessage(chatId, `🎉 *Success!* Redeemed ${creditsToAdd} credits.\nCurrent Balance: *${user.balance} Credits*`);
        return new Response("OK");
      }

      // --- ADMIN COMMANDS (Restricted to ID: 7394600693) ---

      // Generate Redeem Code: /gencode <code_name> <credits>
      if (text.startsWith("/gencode")) {
        if (userId !== ADMIN_ID) {
          await sendMessage(chatId, "⛔ *Admin privileges required.*");
          return new Response("OK");
        }
        const [, code, amount] = text.split(" ");
        if (!code || !amount || isNaN(amount)) {
          await sendMessage(chatId, "⚠️ *Usage:* `/gencode <code> <amount>`");
          return new Response("OK");
        }
        await env.BOT_DB.put(`code_${code}`, amount);
        await sendMessage(chatId, `✅ *Code Created!*\n• Code: \`${code}\`\n• Value: *${amount} Credits*`);
        return new Response("OK");
      }

      // Add Direct Credits: /addcredit <target_user_id> <amount>
      if (text.startsWith("/addcredit")) {
        if (userId !== ADMIN_ID) {
          await sendMessage(chatId, "⛔ *Admin privileges required.*");
          return new Response("OK");
        }
        const [, targetId, amount] = text.split(" ");
        if (!targetId || !amount || isNaN(amount)) {
          await sendMessage(chatId, "⚠️ *Usage:* `/addcredit <user_id> <amount>`");
          return new Response("OK");
        }
        let targetUser = await getUser(env, targetId);
        targetUser.balance += parseInt(amount);
        await saveUser(env, targetId, targetUser);
        await sendMessage(chatId, `✅ *Credits Added!*\n• Target User: \`${targetId}\`\n• Added: *${amount} Credits*\n• New Balance: *${targetUser.balance} Credits*`);
        return new Response("OK");
      }

    } catch (err) {
      console.error(err);
    }

    return new Response("OK");
  }
};
