const { Telegraf } = require('telegraf');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 👉 THAY TOKEN BOT CỦA BẠN VÀO ĐÂY
const BOT_TOKEN = "7123456789:ABCdefGhIJKlmNoPQRstUvWxYz123456";
const PORT = process.env.PORT || 3000;

const app = express();
const bot = new Telegraf(BOT_TOKEN);
const db = new sqlite3.Database('./database.db');

// Tạo bảng dữ liệu nếu chưa có
db.run(`CREATE TABLE IF NOT EXISTS users (
  uid INTEGER PRIMARY KEY,
  name TEXT,
  join_date TEXT,
  quang REAL DEFAULT 2.469,
  diem INTEGER DEFAULT 141,
  cap INTEGER DEFAULT 1
)`);

// Cấu hình đường dẫn đúng
app.use(express.static(path.join(__dirname, 'views')));
app.get('/game/:uid', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Xử lý lệnh /start
bot.start((ctx) => {
  const uid = ctx.from.id;
  const name = ctx.from.first_name;
  const today = new Date().toLocaleDateString('vi-VN');

  db.get(`SELECT uid FROM users WHERE uid = ?`, [uid], (err, row) => {
    if (!row) {
      db.run(`INSERT INTO users (uid, name, join_date) VALUES (?, ?, ?)`, [uid, name, today]);
    }
  });

  // 👉 KHI CHẠY THẬT, THAY LINK NÀY BẰNG LINK HTTPS CỦA BẠN
  const LINK_GAME = `https://vuadaoquang.onrender.com/game/${uid}`;

  ctx.reply(`👋 Chào ${name}!\nChào mừng đến Vua Đào Quặng 🪙`, {
    reply_markup: { inline_keyboard: [[{ text: "🎮 Vào Game", web_app: { url: LINK_GAME } }]] }
  });
});

// Khởi chạy không có lỗi
app.listen(PORT, () => console.log(`✅ Server chạy cổng ${PORT}`));
bot.launch().then(() => console.log(`✅ Bot kết nối thành công!`));
