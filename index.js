const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ===== CONFIG ===== */
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'BIDV_SECRET';

/* ===== LƯU GIAO DỊCH TẠM (DEMO) ===== */
// 👉 thực tế nên dùng DB (Mongo / SQLite)
let transactions = [];

/* ===== API SMS FORWARDER GỬI LÊN ===== */
app.post('/sms', (req, res) => {
  const { secret, bank, content, amount } = req.body;

  if (secret !== SECRET_KEY) {
    return res.status(403).json({ success: false });
  }

  if (bank !== 'BIDV') {
    return res.json({ success: false });
  }

  transactions.push({
    content,
    amount,
    time: Date.now()
  });

  console.log('📩 SMS BIDV:', content, amount);

  res.json({ success: true });
});

/* ===== API CHECK THANH TOÁN ===== */
app.get('/check', (req, res) => {
  const { orderId, amount } = req.query;

  const found = transactions.find(t =>
    t.content.includes(orderId) &&
    Number(t.amount) === Number(amount)
  );

  if (found) {
    return res.json({
      success: true,
      message: 'Đã thanh toán'
    });
  }

  res.json({
    success: false,
    message: 'Chưa có giao dịch'
  });
});

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('BIDV Backend Running');
});

app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
});
