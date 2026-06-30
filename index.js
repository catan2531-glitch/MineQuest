const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

const users = {};
const cd = {};

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

function addExp(u,xp){
  u.exp += xp;
  if(u.exp >= u.level*100){
    u.exp = 0;
    u.level++;
    return true;
  }
  return false;
}

// ===== START =====
bot.start((ctx)=>{
  const u = getUser(ctx.from.id);

  ctx.reply(
`🎮 NVIP GAME

💰 ${u.money}
🏦 ${u.bank}
💎 ${u.diamond}
⭐ Lv ${u.level}

⛏ /mine
🏦 /bank deposit <số>
🏦 /bank withdraw <số>
💸 /withdraw <số>
🌐 web: mở file index.html`
  );
});

// ===== MINE =====
bot.command("mine",(ctx)=>{
  const u = getUser(ctx.from.id);

  if(cd[ctx.from.id] && Date.now()-cd[ctx.from.id]<4000){
    return ctx.reply("⏳ chờ 4s");
  }

  let m = Math.floor(Math.random()*300)+80;
  let d = Math.random()<0.3?1:0;

  u.money += m;
  u.diamond += d;

  let up = addExp(u,10);

  cd[ctx.from.id]=Date.now();

  ctx.reply(`⛏ +${m}💰 +${d}💎 ${up?"🔥LV UP":""}`);
});

// ===== WITHDRAW =====
bot.command("withdraw",(ctx)=>{
  const u = getUser(ctx.from.id);
  const amount = Number(ctx.message.text.split(" ")[1]);

  if(!amount || amount<5000) return ctx.reply("❌ min 5000");
  if(amount>1000000) return ctx.reply("❌ max 1M");
  if(u.money<amount) return ctx.reply("❌ thiếu tiền");

  u.money -= amount;

  ctx.reply(`💸 rút ${amount}`);
});

// ===== BANK =====
bot.command("bank",(ctx)=>{
  const u = getUser(ctx.from.id);
  const a = ctx.message.text.split(" ");

  if <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>NVIP MINER</title>
<style>
body{background:#111;color:#fff;text-align:center;font-family:Arial}
button{padding:15px;background:gold;border:none;border-radius:10px;margin:5px}
</style>
</head>

<body>

<h1>⛏ NVIP MINER 💎</h1>

💰 <span id="money">0</span><br>
💎 <span id="diamond">0</span><br>
⭐ Lv <span id="level">1</span>

<br><br>

<button onclick="mine()">⛏ ĐÀO</button>

<script>
let data = {
  money:0,
  diamond:0,
  level:1,
  exp:0
};

function update(){
  money.innerText=data.money;
  diamond.innerText=data.diamond;
  level.innerText=data.level;
}

function mine(){
  let m = Math.floor(Math.random()*300)+80;
  let d = Math.random()<0.3?1:0;

  data.money += m;
  data.diamond += d;

  data.exp += 10;
  if(data.exp>50){
    data.level++;
    data.exp=0;
    alert("🔥 LEVEL UP");
  }

  update();
}

update();
</script>

</body>
</html>
