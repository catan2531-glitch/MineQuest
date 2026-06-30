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

bot.start((ctx) => {
  const u = getUser(ctx.from.id);

  ctx.reply(
`🎮 BOT GAME

💰 Tiền: ${u.money}
💎 Kim cương: ${u.diamond}

Lệnh:
/daily - nhận quà
/balance - xem ví`
  );
});

bot.command("daily", (ctx) => {
  const u = getUser(ctx.from.id);

  const money = Math.floor(Math.random() * 500) + 100;
  const diamond = Math.floor(Math.random() * 3);

  u.money += money;
  u.diamond += diamond;

  ctx.reply(`🎁 Nhận +${money}💰 +${diamond}💎`);
});

bot.command("balance", (ctx) => {
  const u = getUser(ctx.from.id);

  ctx.reply(
`📊 VÍ CỦA BẠN

💰 ${u.money}
💎 ${u.diamond}`
  );
});

bot.launch();

console.log("Bot running...");