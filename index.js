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

// ✅ ENDPOINT NHẬN SMS / NOTIFICATION
app.post("/sms", (req, res) => {
  console.log("📩 SMS RECEIVED");
  console.log(req.body);

  // BẮT BUỘC trả 200 để app không retry
  res.status(200).send("OK");
});

// Bắt nhầm GET /sms
app.get("/sms", (req, res) => {
  res.send("SMS endpoint alive (POST only)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
