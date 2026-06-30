const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ===== DATA =====
const users = {};
const lastDaily = {};
const withdrawCooldown = {};

const MIN_WITHDRAW = 1000;

// ===== USER =====
function getUser(id) {
  if (!users[id]) {
    users[id] = {
      money: 0,
      diamond: 0,
      level: 1,
      exp: 0
    };
  }
  return users[id];
}

// ===== LEVEL UP =====
function addExp(user, amount) {
  user.exp += amount;

  if (user.exp >= user.level * 100) {
    user.exp = 0;
    user.level += 1;
    return true;
  }
  return false;
}

// ===== START =====
bot.start((ctx) => {
  const u = getUser(ctx.from.id);

  ctx.replyWithPhoto(
    "https://i.imgur.com/your-image.jpg",
    {
      caption: `🔥 SẢNH SIÊU VIP

💰 Tiền: ${u.money}
💎 Kim cương: ${u.diamond}
⭐ Level: ${u.level}
📈 EXP: ${u.exp}/${u.level * 100}`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "💎 Sảnh Gem", callback_data: "gem" }],
          [{ text: "💰 Nhận quà", callback_data: "daily" }],
          [{ text: "📊 Ví", callback_data: "balance" }]
        ]
      }
    }
  );
});

// ===== BUTTONS =====
bot.on("callback_query", (ctx) => {
  const id = ctx.from.id;
  const u = getUser(id);
  const data = ctx.callbackQuery.data;

  if (data === "gem") {
    return ctx.reply("💎 Shop sắp mở (VIP system)");
  }

  if (data === "daily") {
    const now = Date.now();

    if (lastDaily[id] && now - lastDaily[id] < 24 * 60 * 60 * 1000) {
      return ctx.reply("⏳ Bạn đã nhận hôm nay rồi");
    }

    const money = Math.floor(Math.random() * 700) + 200;
    const diamond = Math.floor(Math.random() * 5);
    const exp = Math.floor(Math.random() * 20) + 10;

    u.money += money;
    u.diamond += diamond;

    const leveled = addExp(u, exp);
    lastDaily[id] = now;

    return ctx.reply(
`🎁 +${money}💰 +${diamond}💎
📈 +${exp} EXP${leveled ? "\n🔥 LEVEL UP!" : ""}`
    );
  }

  if (data === "balance") {
    return ctx.reply(`📊 VÍ VIP

💰 ${u.money}
💎 ${u.diamond}
⭐ Level: ${u.level}
📈 EXP: ${u.exp}/${u.level * 100}`);
  }
});

// ===== WITHDRAW VIP =====
bot.command("withdraw", (ctx) => {
  const id = ctx.from.id;
  const u = getUser(id);

  const now = Date.now();

  if (withdrawCooldown[id] && now - withdrawCooldown[id] < 10000) {
    const wait = Math.ceil((10000 - (now - withdrawCooldown[id])) / 1000);
    return ctx.reply(`⏳ Chờ ${wait}s`);
  }

  const amount = Number(ctx.message.text.split(" ")[1]);

  if (!amount || isNaN(amount)) {
    return ctx.reply("❌ /withdraw <số tiền>");
  }

  if (amount < MIN_WITHDRAW) {
    return ctx.reply(`❌ Min rút ${MIN_WITHDRAW}`);
  }

  if (u.money < amount) {
    return ctx.reply("❌ Không đủ tiền");
  }

  u.money -= amount;
  withdrawCooldown[id] = now;

  ctx.reply(`💸 RÚT VIP THÀNH CÔNG\n-${amount}💰`);
});

// ===== RUN =====
bot.launch();
console.log("🔥 VIP BOT RUNNING");
