import express from "express";
import {forgotPassword,resetPassword,changePassword,  registerUser,loginUser , updateProfile,getProfile,getAllUsers, searchUsersBySkill, verifyEmail, resendVerificationEmail, firebaseLogin, verifyOtp} from "../controller/user.controller.js";
import verifyToken from "../middleware//auth.middleware.js"
import { upload } from "../middleware/fileUpload.js";
import { createProject,getAllProjects,getProjectById,updateProject,deleteProject,getMyProjects,getAllTechnologies } from "../controller/project.controller.js";

import { addEducation, getEducation,updateEducation,deleteEducation } from "../controller/education.controller.js";
import { addSkill,getSkills,updateSkill,deleteSkill } from "../controller/skill.controller.js";

import { body } from "express-validator";



const router = express.Router();
router.post("/firebase-login", firebaseLogin);
router.post("/verify-otp",verifyOtp);

router.post("/register",
    body("name","name is require").notEmpty(),
    body("name", "Name should contain only alphabets")
  .matches(/^[A-Za-z ]+$/)
  .isLength({ min: 2 }),
    body("email","email is required ").notEmpty(),
    body("email","email is not valid ").isEmail(),
    body("password","password is required").notEmpty(),
    body("password","password should have 6 to 10 digits").isLength({min:6,max:10}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,10}$/),
    body("confirmPassword", "Confirm password is required").notEmpty(),
    registerUser);

  router.get('/verify-email/:userId/:token', verifyEmail);

  router.post('/resend-verification', resendVerificationEmail);
router.post("/login",
  body("email","email is required ").notEmpty(),
  body("email","email is not valid ").isEmail(),
  body("password","password is required").notEmpty(),
  body("password","password should have 6 to 10 digits").isLength({min:6,max:10}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,10}$/),
  loginUser);

router.patch("/profile",verifyToken, upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),updateProfile);

router.get("/profile/:id",getProfile);

router.get("/all",verifyToken,getAllUsers);

router.get("/search", verifyToken, searchUsersBySkill);

router.post("/add-education",verifyToken,
   body("institution_name","institude name is requires ").notEmpty(),
   body("degree","degree is requires ").notEmpty(),
   body("field_of_study","degree name is requires ").notEmpty(),
   body("start_date","start date name is requires ").notEmpty(),
   body("end_date","end date is requires ").notEmpty(),addEducation);

router.get("/education/:userId",getEducation);
router.put("/update/:id",verifyToken,updateEducation);
router.delete("/delete/:id",verifyToken,deleteEducation);

router.post("/addskill",verifyToken,
  body("skillName","skill is requires ").notEmpty(),
  addSkill);
router.get("/skill/:userId",getSkills);
router.put("/updateskill/:id",verifyToken,updateSkill);
router.delete("/deleteskill/:id",verifyToken,deleteSkill);

router.post("/changed-password",verifyToken,body("password","password is required").notEmpty(),
body("password","password should have 6 to 10 digits").isLength({min:6,max:10}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,10}$/),changePassword);

router.post("/forgot-password", body("email","email is required ").notEmpty(),
  body("email","email is not valid ").isEmail(), forgotPassword);

router.post("/reset-password",body("newPassword","password is required").notEmpty(),
  body("newPassword","password should have 6 to 10 digits").isLength({min:6,max:10}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,10}$/), resetPassword);

router.post("/projects", verifyToken, 
  body("title","title is required").notEmpty(),
  body("description","discription is required").notEmpty(),
  body("technical_stack","technical_stack is required").notEmpty(),
  body("deadline","deadline is required").notEmpty(),
  body("members_needed"," members_needed is required").notEmpty(),
  body("technologyIds","technology is reuired  is required").notEmpty(),
 createProject);
router.get("/",verifyToken,getAllProjects);

router.put("/project/:id",verifyToken,updateProject);
router.delete("/project/:id", verifyToken, deleteProject);
router.get("/project/my-projects",verifyToken,getMyProjects);
router.get("/project/technology",getAllTechnologies);
router.get("/project/:id",getProjectById);

export default router;
