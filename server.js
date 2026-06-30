const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let users = {};
let withdrawLog = {};

function today(){
  return new Date().toISOString().split("T")[0];
}

// LOGIN
app.post("/login",(req,res)=>{
  const {id} = req.body;

  if(!users[id]){
    users[id] = {
      vnd:0,
      coal:0,
      diamond:0,
      emerald:0
    };
  }

  res.json(users[id]);
});

// MINE
app.post("/mine",(req,res)=>{
  const {id} = req.body;
  let u = users[id];

  let r = Math.random();

  if(r < 0.7) u.coal++;
  else if(r < 0.95) u.diamond++;
  else u.emerald++;

  res.json(u);
});

// CONVERT VND
app.post("/convert",(req,res)=>{
  const {id} = req.body;
  let u = users[id];

  u.vnd += u.coal*10 + u.diamond*100 + u.emerald*500;

  u.coal = 0;
  u.diamond = 0;
  u.emerald = 0;

  res.json(u);
});

// WITHDRAW (20K / DAY LIMIT)
app.post("/withdraw",(req,res)=>{
  const {id,amount} = req.body;
  let u = users[id];

  if(!withdrawLog[id]) withdrawLog[id] = {date:today(),total:0};

  if(withdrawLog[id].date !== today()){
    withdrawLog[id] = {date:today(),total:0};
  }

  if(withdrawLog[id].total + amount > 20000){
    return res.json({error:"limit 20k/day"});
  }

  if(u.vnd < amount){
    return res.json({error:"not enough"});
  }

  u.vnd -= amount;
  withdrawLog[id].total += amount;

  res.json({
    ok:true,
    msg:"withdraw request sent",
    today:withdrawLog[id].total
  });
});

// LEADERBOARD
app.get("/top",(req,res)=>{
  let arr = Object.entries(users).map(([id,u])=>({
    id,
    vnd:u.vnd
  }));

  arr.sort((a,b)=>b.vnd-a.vnd);

  res.json(arr.slice(0,10));
});

app.listen(3000,()=>{
  console.log("PRO SERVER RUN");
}); app.post("/spin",(req,res)=>{
  const {id} = req.body;
  let u = users[id];

  if(!u) return res.json({error:"no user"});

  let r = Math.random();

  let reward = 0;
  let msg = "";

  if(r < 0.5){
    reward = 1000;
    msg = "💸 +1.000 VND";
  }
  else if(r < 0.8){
    reward = 5000;
    msg = "💸 +5.000 VND";
  }
  else if(r < 0.95){
    reward = 10000;
    msg = "💸 +10.000 VND";
  }
  else{
    reward = 20000;
    msg = "🎉 JACKPOT +20.000 VND";
  }

  u.vnd += reward;

  res.json({
    msg,
    vnd:u.vnd
  });
});