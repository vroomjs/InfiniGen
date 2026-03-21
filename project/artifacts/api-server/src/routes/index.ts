import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import imageRouter from "./image";
import downloadRouter from "./download";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(imageRouter);
router.use(downloadRouter);

export default router;
