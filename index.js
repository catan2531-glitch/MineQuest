
// ===============const { Telegraf } = require('telegraf');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

// === Cấu hình ===
const BOT_TOKEN = 'Điền_TOKEN_BOT_của_bạn_đây';
const app = express();
const bot = new Telegraf(BOT_TOKEN);
const db = new sqlite3.Database('./data.db');

// === Khởi tạo CSDL ===
db.run(`CREATE TABLE IF NOT EXISTS users (
  uid INTEGER PRIMARY KEY,
  name TEXT,
  join_date TEXT,
  quang REAL DEFAULT 0,
  diem INTEGER DEFAULT 0,
  cap INTEGER DEFAULT 1,
  ref_count INTEGER DEFAULT 0,
  referred_by INTEGER DEFAULT NULL
)`);

// === Middleware ===
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));

// === Route giao diện ===
app.get('/game/:uid', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// === Xử lý Bot Telegram ===
bot.start(async (ctx) => {
  const uid = ctx.from.id;
  const name = ctx.from.first_name;
  const ref = ctx.startPayload;

  // Thêm người dùng mới nếu chưa có
  db.get(`SELECT * FROM users WHERE uid = ?`, [uid], (err, row) => {
    if (!row) {
      db.run(`INSERT INTO users (uid, name, join_date, referred_by) VALUES (?, ?, ?, ?)`,
        [uid, name, new Date().toLocaleDateString(), ref || null]);
      // Cộng thưởng cho người giới thiệu
      if (ref) {
        db.run(`UPDATE users SET ref_count = ref_count + 1, quang = quang + 500, diem = diem + 5 WHERE uid = ?`, [ref]);
      }
    }
  });

  // Gửi nút vào trò chơi
  ctx.reply(`👋 Chào ${name}! Chào mừng đến Vua Đào Quặng!\n\n💰 Tích lũy quặng, nâng cấp máy, nhận thưởng mỗi ngày!`, {
    reply_markup: {
      inline_keyboard: [[{ text: "🎮 Vào Trò Chơi", web_app: { url: `https://tên-máy-chủ-của-bạn.com/game/${uid}` } }]]
    }
  });
});

// === Khởi chạy ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy cổng ${PORT}`));
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
= AUTH =================
function auth(req,res,next){
  try{
    let data = jwt.verify(req.body.token, SECRET);
    req.id = data.id;
    next();
  }catch(e){
    return res.json({error:"invalid token"});
  }
}

// ================= MINE SYSTEM =================
app.post("/mine",auth,(req,res)=>{
  let id = req.id;
  let u = getUser(id);

  let now = Date.now();
  if(cooldown[id] && now - cooldown[id] < 700){
    return res.json({error:"cooldown"});
  }
  cooldown[id] = now;

  let gain = Math.floor(Math.random() * u.power) + 1;

  u.gem += gain;
  u.coin += gain * 5;

  u.level = Math.floor(u.coin / 1000) + 1;

  res.json(u);
});

// ================= SHOP =================
app.post("/shop",auth,(req,res)=>{
  let id = req.id;
  let u = getUser(id);

  if(u.coin < 500){
    return res.json({error:"not enough coin"});
  }

  u.coin -= 500;
  u.power += 1;

  res.json(u);
});

// ================= TOP =================
app.get("/top",(req,res)=>{
  let arr = Object.entries(users).map(([id,u])=>({
    id,
    coin:u.coin,
    level:u.level
  }));

  arr.sort((a,b)=>b.coin - a.coin);

  res.json(arr.slice(0,10));
});

// ================= BOT =================
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx)=>{
  let id = ctx.from.id;
  getUser(id);
  ctx.reply("🔥 ULTRA SERVER ONLINE");
});

bot.command("mine",(ctx)=>{
  let id = ctx.from.id;
  let u = getUser(id);

  u.gem += 1;
  u.coin += 10;

  ctx.reply(`⛏ +1 gem | 💰 ${u.coin}`);
});

bot.launch();

// ================= SERVER =================
app.listen(process.env.PORT || 3000,()=>{
  console.log("🚀 ULTRA SERVER RUNNING");
});
