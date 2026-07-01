const { Telegraf } = require('telegraf');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// === CẤU HÌNH ===
const BOT_TOKEN = "THAY_TOKEN_BOT_CUA_BAN_VAO_DAY"; // Lấy từ @BotFather
const PORT = process.env.PORT || 3000;
const app = express();
const bot = new Telegraf(BOT_TOKEN);
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('❌ Lỗi kết nối CSDL:', err.message);
  else console.log('✅ Kết nối CSDL thành công');
});

// === TẠO BẢNG DỮ LIỆU ===
db.run(`CREATE TABLE IF NOT EXISTS users (
  uid INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  join_date TEXT NOT NULL,
  quang REAL DEFAULT 2.469,
  diem INTEGER DEFAULT 141,
  cap INTEGER DEFAULT 1
)`, (err) => {
  if (err) console.error('❌ Lỗi tạo bảng:', err.message);
});

// === CẤU HÌNH MÁY CHỦ ===
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

// === ĐƯỜNG DẪN GAME ===
app.get('/game/:uid', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  } catch (err) {
    res.status(404).send('❌ Không tìm thấy trò chơi');
  }
});

// === XỬ LÝ BOT - ĐÃ SỬA LỖI BẤT ĐỒNG BỘ ===
bot.start(async (ctx) => {
  try {
    const uid = ctx.from.id;
    const name = ctx.from.first_name || "Bạn";
    const today = new Date().toLocaleDateString('vi-VN');

    // Kiểm tra người dùng
    db.get(`SELECT uid FROM users WHERE uid = ?`, [uid], (err, user) => {
      if (err) return console.error('❌ Lỗi kiểm tra người dùng:', err);
      if (!user) {
        db.run(`INSERT INTO users (uid, name, join_date) VALUES (?, ?, ?)`, 
          [uid, name, today], (err) => {
            if (err) console.error('❌ Lỗi thêm người dùng:', err);
          });
      }
    });

    // ⚠️ KHI CHẠY THẬT, THAY LINK NÀY BẰNG LINK HTTPS CỦA BẠN
    // Ví dụ: https://ten-cua-hang.onrender.com/game/${uid}
    const LINK_GAME = `https://vuadaoquang-test.onrender.com/game/${uid}`;

    await ctx.reply(`👋 Chào mừng ${name} đến Vua Đào Quặng!\n💰 Tích lũy quặng, nâng cấp máy ngay!`, {
      reply_markup: {
        inline_keyboard: [[
          { text: "🎮 VÀO TRÒ CHƠI", web_app: { url: LINK_GAME } }
        ]]
      }
    });
  } catch (err) {
    console.error('❌ Lỗi xử lý /start:', err);
    await ctx.reply('⚠️ Có lỗi xảy ra, vui lòng thử lại sau!');
  }
});

// === KHỞI CHẠY - ĐÃ BẮT ĐẦY ĐỦ LỖI ===
async function startApp() {
  try {
    app.listen(PORT, () => console.log(`✅ Máy chủ chạy tại cổng ${PORT}`));
    await bot.launch();
    console.log(`✅ Bot Telegram hoạt động ổn!`);
  } catch (err) {
    console.error('❌ Lỗi khởi động:', err.message);
    process.exit(1);
  }
}

startApp();

// Dừng an toàn
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
