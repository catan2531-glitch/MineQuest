const express = require("express");
const jwt = require("jsonwebtoken");
const { Telegraf } = require("telegraf");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const SECRET = "ULTRA_SECRET_999";

// ================= DATABASE =================
let users = {};
let cooldown = {};

// ================= USER CREATE =================
function getUser(id){
  if(!users[id]){
    users[id] = {
      coin: 0,
      gem: 0,
      power: 1,
      level: 1
    };
  }
  return users[id];
}

// ================= LOGIN =================
app.post("/login",(req,res)=>{
  let id = req.body.id;

  let token = jwt.sign({id}, SECRET, {expiresIn:"1d"});
  let u = getUser(id);

  res.json({token, user:u});
});

// ================= AUTH =================
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
