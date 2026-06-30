const express = require("express");
const jwt = require("jsonwebtoken");
const { Telegraf } = require("telegraf");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const SECRET = "ultra_secret_key";

// ===== DATABASE (fake but persistent in RAM) =====
let users = {};
let cooldown = {};

// ===== TOKEN CREATE =====
function createToken(id){
  return jwt.sign({id}, SECRET, {expiresIn:"1d"});
}

// ===== VERIFY =====
function auth(req,res,next){
  try{
    let token = req.body.token;
    let data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  }catch(e){
    res.json({error:"invalid token"});
  }
}

// ===== LOGIN =====
app.post("/login",(req,res)=>{
  let id = req.body.id;

  if(!users[id]){
    users[id] = {
      coin:0,
      gem:0,
      power:1
    };
  }

  res.json({
    token: createToken(id),
    data: users[id]
  });
});

// ===== MINE ULTRA =====
app.post("/mine",auth,(req,res)=>{
  let id = req.userId;

  if(!users[id]) return res.json({error:"no user"});

  let now = Date.now();
  if(cooldown[id] && now - cooldown[id] < 800){
    return res.json({error:"cooldown"});
  }

  cooldown[id] = now;

  let u = users[id];

  let gain = Math.floor(Math.random()*u.power)+1;

  u.gem += gain;
  u.coin += gain * 5;

  res.json(u);
});

// ===== SHOP =====
app.post("/shop",auth,(req,res)=>{
  let id = req.userId;
  let u = users[id];

  if(u.coin >= 500){
    u.coin -= 500;
    u.power += 1;
    return res.json({msg:"POWER UP!",u});
  }

  res.json({error:"not enough coin"});
});

// ===== TOP =====
app.get("/top",(req,res)=>{
  let arr = Object.entries(users).map(([id,u])=>({
    id,
    coin:u.coin
  }));

  arr.sort((a,b)=>b.coin-a.coin);

  res.json(arr.slice(0,10));
});

// ===== BOT =====
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx)=>{
  ctx.reply("🔥 ULTRA GOD MODE BOT ONLINE");
});

bot.command("mine",(ctx)=>{
  let id = ctx.from.id;

  if(!users[id]){
    users[id]={coin:0,gem:0,power:1};
  }

  users[id].gem++;
  users[id].coin += 10;

  ctx.reply(`⛏ +1 gem | 💰 ${users[id].coin}`);
});

bot.launch();

app.listen(process.env.PORT || 3000,()=>{
  console.log("🚀 ULTRA GOD MODE RUN");
});
