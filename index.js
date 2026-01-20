import express from "express";

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use((req, res, next) => {
  console.log("==== REQUEST ====");
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("BODY:", req.body);
  next();
});

/* ================== DATABASE GIẢ (RAM) ================== */
// sau này đổi sang Mongo / MySQL
const orders = {}; 
// orders[orderId] = { amount, paid, time }

/* ================== HEALTH CHECK ================== */
app.get("/healthz", (req, res) => {
  res.send("OK");
});

/* ================== TẠO ĐƠN ================== */
app.post("/create-order", (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: "Missing data" });
  }

  orders[orderId] = {
    amount: Number(amount),
    paid: false,
    time: Date.now(),
  };

  console.log("🧾 ORDER CREATED:", orders[orderId]);

  res.json({ success: true });
});

/* ================== NHẬN SMS / NOTIFICATION ================== */
app.post("/sms", (req, res) => {
  const text =
    req.body?.content ||
    req.body?.text ||
    req.body ||
    "";

  console.log("📩 RAW TEXT:", text);

  if (!text) {
    return res.send("NO DATA");
  }

  // 1️⃣ LẤY SỐ TIỀN
  const moneyMatch = text.match(/([\d,.]+)\s*VND|\+([\d,.]+)/i);
  const amount = moneyMatch
    ? Number((moneyMatch[1] || moneyMatch[2]).replace(/,/g, ""))
    : 0;

  // 2️⃣ LẤY ORDER ID (VD: DH1705778899000)
  const orderMatch = text.match(/DH\d+/i);
  const orderId = orderMatch ? orderMatch[0] : null;

  console.log("💰 AMOUNT:", amount);
  console.log("🆔 ORDER:", orderId);

  if (!orderId || !amount) {
    return res.send("IGNORED");
  }

  // 3️⃣ CHECK ĐƠN
  const order = orders[orderId];
  if (!order) {
    console.log("❌ ORDER NOT FOUND");
    return res.send("ORDER NOT FOUND");
  }

  if (order.paid) {
    console.log("⚠️ ORDER ALREADY PAID");
    return res.send("DUPLICATE");
  }

  if (order.amount !== amount) {
    console.log("❌ AMOUNT NOT MATCH");
    return res.send("AMOUNT NOT MATCH");
  }

  // 4️⃣ ĐÁNH DẤU ĐÃ THANH TOÁN
  order.paid = true;
  order.paidTime = Date.now();

  console.log("✅ PAYMENT SUCCESS:", orderId);

  res.send("OK");
});

/* ================== CHECK TRẠNG THÁI ĐƠN ================== */
app.get("/check-order/:id", (req, res) => {
  const order = orders[req.params.id];
  if (!order) return res.json({ found: false });

  res.json(order);
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
