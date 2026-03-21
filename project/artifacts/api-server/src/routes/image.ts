import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/image", (req, res) => {
  // Read prompt from query string; required for a useful image
  const prompt = (req.query.prompt as string) || "a beautiful landscape";

  // Optional parameters with sensible defaults
  const model = (req.query.model as string) || "flux";
  const width = (req.query.width as string) || "512";
  const height = (req.query.height as string) || "512";

  // Random seed so each request produces a unique image
  const seed = Math.floor(Math.random() * 100000);

  // Build the Pollinations image URL
  const imageUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}`;

  // Redirect the client directly to the image URL
  res.redirect(imageUrl);
});

export default router;
