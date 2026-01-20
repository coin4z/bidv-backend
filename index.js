import express from "express";

const app = express();

// Nhận mọi loại body
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Log mọi request (RẤT QUAN TRỌNG)
app.use((req, res, next) => {
  console.log("==== REQUEST ====");
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
  next();
});

// Health check cho Render
app.get("/healthz", (req, res) => {
  res.send("OK");
});

// ✅ ENDPOINT NHẬN SMS
app.post("/sms", (req, res) => {
  console.log("📩 SMS RECEIVED");

  const data = req.body;

  // Trả 200 để app KHÔNG báo Fail
  res.status(200).json({
    success: true,
    received: data,
  });
});

// Bắt lỗi GET nhầm
app.get("/sms", (req, res) => {
  res.send("SMS endpoint alive (POST only)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
