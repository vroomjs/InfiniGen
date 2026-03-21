import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/ai", async (req, res) => {
  const prompt = (req.query.prompt as string) || "say something cool";

  // Random seed ensures the same prompt produces a different response each time
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${seed}`;

  try {
    const r = await fetch(url);
    const text = await r.text();
    res.send(text);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch from Pollinations AI");
    res.status(500).send("error");
  }
});

export default router;
