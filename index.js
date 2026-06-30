const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// dữ liệu tạm
const users = {};

function getUser(id) {
  if (!users[id]) {
    users[id] = { money: 0, diamond: 0 };
  }
  return users[id];
}

// 🎮 SẢNH CHÍNH
bot.start((ctx) => {
  const u = getUser(ctx.from.id);

  ctx.reply(
`🎮 SẢNH CHÍNH

💰 Tiền: ${u.money}
💎 Kim cương: ${u.diamond}`,
{
    reply_markup: {
      inline_keyboard: [
        [{ text: "💎 Sảnh Gem", callback_data: "gem" }],
        [{ text: "💰 Nhận quà", callback_data: "daily" }],
        [{ text: "📊 Xem ví", callback_data: "balance" }]
      ]
    }
  });
});

// 💎 xử lý nút bấm
bot.on("callback_query", (ctx) => {
  const data = ctx.callbackQuery.data;
  const u = getUser(ctx.from.id);

  if (data === "gem") {
    ctx.reply("💎 Chào mừng đến Sảnh Gem!");
  }

  if (data === "daily") {
    const money = Math.floor(Math.random() * 500) + 100;
    const diamond = Math.floor(Math.random() * 3);

    u.money += money;
    u.diamond += diamond;

    ctx.reply(`🎁 Nhận +${money}💰 +${diamond}💎`);
  }

  if (data === "balance") {
    ctx.reply(`📊 Ví của bạn\n💰 ${u.money}\n💎 ${u.diamond}`);
  }
});

bot.launch();

console.log("Bot running...");
