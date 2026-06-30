const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ===== DATA =====
const users = {};
const cd = {};
const invitedBy = {};

// ===== USER =====
function getUser(id){
  if(!users[id]){
    users[id] = {
      money:0,
      diamond:0,
      bank:0,
      level:1,
      exp:0
    };
  }
  return users[id];
}

// ===== LEVEL =====
function addExp(u,xp){
  u.exp += xp;
  if(u.exp >= u.level * 100){
    u.exp = 0;
    u.level++;
    return true;
  }
  return false;
}

// ===== START =====
bot.start((ctx)=>{
  const id = ctx.from.id;
  const u = getUser(id);

  const args = ctx.message.text.split(" ");

  // REF SYSTEM
  if(args[1] && !invitedBy[id]){
    const ref = args[1].replace("REF","");
    const owner = getUser(ref);

    if(ref && ref != id){
      owner.money += 200;
      u.money += 100;
      invitedBy[id] = ref;
    }
  }

  ctx.reply(
`🎮 VIP GAME FULL

💰 ${u.money}
🏦 ${u.bank}
💎 ${u.diamond}
⭐ Lv ${u.level}

🔗 Link mời:
https://t.me/${ctx.botInfo.username}?start=REF${id}

⛏ /mine
💸 /withdraw <số>
🏦 /bank deposit|withdraw <số>`
  );
});

// ===== MINE =====
bot.command("mine",(ctx)=>{
  const id = ctx.from.id;
  const u = getUser(id);

  if(cd[id] && Date.now() - cd[id] < 4000){
    return ctx.reply("⏳ chờ 4s");
  }

  let money = Math.floor(Math.random()*300)+80;
  let diamond = Math.random()<0.3?1:0;
  let xp = Math.floor(Math.random()*10)+5;

  u.money += money;
  u.diamond += diamond;

  let up = addExp(u,xp);

  cd[id] = Date.now();

  ctx.reply(
`⛏ ĐÀO

+${money}💰
+${diamond}💎
+${xp} EXP
${up ? "🔥 LEVEL UP!" : ""}`
  );
});

// ===== WITHDRAW =====
bot.command("withdraw",(ctx)=>{
  const u = getUser(ctx.from.id);
  const amount = Number(ctx.message.text.split(" ")[1]);

  if(!amount || isNaN(amount)){
    return ctx.reply("❌ /withdraw <số>");
  }

  if(amount < 5000) return ctx.reply("❌ Min 5000");
  if(amount > 1000000) return ctx.reply("❌ Max 1M");
  if(u.money < amount) return ctx.reply("❌ Không đủ tiền");

  u.money -= amount;

  ctx.reply(`💸 RÚT ${amount}💰`);
});

// ===== BANK =====
bot.command("bank",(ctx)=>{
  const u = getUser(ctx.from.id);
  const a = ctx.message.text.split(" ");

  if(a[1] === "deposit"){
    let x = Number(a[2]);
    if(u.money < x) return ctx.reply("❌ thiếu tiền");

    u.money -= x;
    u.bank += x;

    return ctx.reply(`🏦 gửi ${x}`);
  }

  if(a[1] === "withdraw"){
    let x = Number(a[2]);
    if(u.bank < x) return ctx.reply("❌ thiếu bank");

    u.bank -= x;
    u.money += x;

    return ctx.reply(`💸 rút ${x}`);
  }

  ctx.reply("🏦 bank deposit/withdraw <số>");
});

// ===== BALANCE =====
bot.command("balance",(ctx)=>{
  const u = getUser(ctx.from.id);

  ctx.reply(
`📊 VÍ

💰 ${u.money}
🏦 ${u.bank}
💎 ${u.diamond}
⭐ Lv ${u.level}`
  );
});

bot.launch();
console.log("🔥 VIP GAME FULL RUNNING");
