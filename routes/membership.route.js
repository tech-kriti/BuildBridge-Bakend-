import express from "express";
import { getProjectMembers,getMyProjects ,removeMember,updateMemberRole, leaveProject} from "../controller/membership.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/my-projects",verifyToken,getMyProjects);
router.delete("/:projectId/remove/:userId", verifyToken, removeMember);

router.get("/:project_id", verifyToken, getProjectMembers);
router.put("/:projectId/update-role/:userId", verifyToken, updateMemberRole);
router.delete("/leave/:projectId", verifyToken, leaveProject);


export default router;
