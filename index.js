/**
 * BIDV Backend - Render Ready
 * Author: Demo chuẩn triển khai thật
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* =========================
   CONFIG
========================= */
const PORT = process.env.PORT || 3000;
const SMS_SECRET = process.env.SMS_SECRET || 'bidv123';

/**
 * LƯU TẠM GIAO DỊCH (DEMO)
 * Thực tế có thể thay bằng DB
 */
let transactions = []; // { amount, orderId, content, time }

/* =========================
   HEALTH CHECK (BẮT BUỘC)
========================= */
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

/* =========================
   ROOT TEST
========================= */
app.get('/', (req, res) => {
  res.send('✅ BIDV backend is running');
});

/* =========================
   SMS WEBHOOK (TỪ SMS FORWARDER)
========================= */
/**
 * SMS Forwarder cấu hình:
 * URL: https://xxx.onrender.com/sms
 * Method: POST
 * Header: x-secret: bidv123
 *
 * Body (JSON):
 * {
 *   "message": "BIDV: +50,000 VND. ND: DH1700000000. So du: ..."
 * }
 */
app.post('/sms', (req, res) => {
  const secret = req.headers['x-secret'];

  if (secret !== SMS_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }

  const sms = req.body.message || '';
  console.log('📩 SMS:', sms);

  /**
   * PARSE SỐ TIỀN + ORDER ID
   * VD: "+50,000 VND" & "DH1700000000"
   */
  const amountMatch = sms.match(/([\d,.]+)\s*VND/);
  const orderMatch = sms.match(/DH\d+/);

  if (!amountMatch || !orderMatch) {
    return res.json({ success: false, message: 'Không tìm thấy giao dịch hợp lệ' });
  }

  const amount = parseInt(amountMatch[1].replace(/[,\.]/g, ''), 10);
  const orderId = orderMatch[0];

  const tx = {
    amount,
    orderId,
    content: sms,
    time: Date.now()
  };

  transactions.push(tx);

  console.log('✅ LƯU GIAO DỊCH:', tx);

  res.json({ success: true });
});

/* =========================
   CHECK THANH TOÁN
========================= */
/**
 * Frontend gọi:
 * GET /check-payment?orderId=DHxxx&amount=50000
 */
app.get('/check-payment', (req, res) => {
  const { orderId, amount } = req.query;

  if (!orderId || !amount) {
    return res.json({ paid: false, message: 'Thiếu tham số' });
  }

  const amt = parseInt(amount, 10);

  const found = transactions.find(
    tx => tx.orderId === orderId && tx.amount === amt
  );

  if (found) {
    return res.json({
      paid: true,
      orderId,
      amount: amt,
      time: found.time
    });
  }

  res.json({ paid: false });
});

/* =========================
   START SERVER (QUAN TRỌNG)
========================= */
app.listen(PORT, () => {
  console.log('🚀 BIDV backend running on port', PORT);
});
