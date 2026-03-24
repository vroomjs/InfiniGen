require("dotenv").config();
const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.json());
app.use(express.static("."));

// 🌍 OPTIONAL BUT IMPORTANT (CORS for other sites)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// ======================================================
// 🚀 GET API (PLAYGROUND USE)
// ======================================================
app.get("/generate-text", async (req, res) => {

  const prompt = req.query.prompt;
  const maxTokens = parseInt(req.query.max_tokens) || 1000;

  // ❌ 300 — Missing prompt
  if (!prompt) {
    return res.status(300).json({
      success: false,
      code: 300,
      error: "Missing prompt"
    });
  }

  // ❌ 600 — Invalid query
  if (req.query.max_tokens && isNaN(parseInt(req.query.max_tokens))) {
    return res.status(400).json({
      success: false,
      code: 600,
      error: "Invalid max_tokens"
    });
  }

  // ✅ STREAM
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        stream: true
      })
    });

    response.body.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") {
            res.write("event: done\ndata: done\n\n");
            res.end();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;

            if (content) {
              res.write(`data: ${content}\n\n`);
            }

          } catch {}
        }
      }
    });

    response.body.on("end", () => res.end());
    response.body.on("error", (err) => {
      res.write(`data: [ERROR] ${err.message}\n\n`);
      res.end();
    });

  } catch (err) {
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
});


// ======================================================
// 🧠 POST API (MAIN DEVELOPER ENDPOINT)
// ======================================================
app.post("/v1/chat", async (req, res) => {

  const { messages, stream, max_tokens } = req.body;

  // ❌ 300 — Missing messages
  if (!messages || !Array.isArray(messages)) {
    return res.status(300).json({
      success: false,
      code: 300,
      error: "Missing messages array"
    });
  }

  const tokens = max_tokens || 1000;

  // =========================
  // STREAM MODE
  // =========================
  if (stream) {

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          max_tokens: tokens,
          stream: true
        })
      });

      response.body.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");

        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();

            if (data === "[DONE]") {
              res.write("event: done\ndata: done\n\n");
              res.end();
              return;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;

              if (content) {
                res.write(`data: ${content}\n\n`);
              }

            } catch {}
          }
        }
      });

      response.body.on("end", () => res.end());
      response.body.on("error", (err) => {
        res.write(`data: [ERROR] ${err.message}\n\n`);
        res.end();
      });

    } catch (err) {
      res.write(`data: [ERROR] ${err.message}\n\n`);
      res.end();
    }

  } else {

    // =========================
    // NON-STREAM MODE
    // =========================
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          max_tokens: tokens
        })
      });

      const data = await response.json();

      if (!data.choices) {
        return res.status(400).json({
          success: false,
          code: 400,
          error: "Bad AI response",
          full: data
        });
      }

      res.json({
        success: true,
        code: 200,
        response: data.choices[0].message.content
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        code: 500,
        error: err.message
      });
    }
  }
});


// ❌ WRONG ENDPOINT
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 500,
    error: "Wrong endpoint"
  });
});


// START
app.listen(3000, () => {
  console.log("🚀 InfiniGen running at http://localhost:3000");
});