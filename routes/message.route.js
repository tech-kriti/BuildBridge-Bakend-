import express from "express";
import { sendMessage,getMessageByProjectID } from "../controller/message.controller.js";

import verifyToken from "../middleware/auth.middleware.js"
const router = express.Router();
router.post("/",verifyToken,sendMessage);
router.get("/:projectId",verifyToken,getMessageByProjectID);
export default router;