import express from "express";

import { sendCollabReq,getSentRequests,getRecievedRequest,updateRequestStatus } from "../controller/collaboration.controller.js";

import verifyToken from "../middleware/auth.middleware.js"


const router = express.Router();


router.post("/send",verifyToken,sendCollabReq);
router.get("/sent",verifyToken,getSentRequests);
router.get("/recieved",verifyToken,getRecievedRequest);
router.put("/:id",verifyToken,updateRequestStatus);
export default router;