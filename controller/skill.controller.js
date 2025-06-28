import Skill from "../model/Skill.model.js";
import { validationResult } from "express-validator";

// Add Skill
export const addSkill = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: "Bad request", error: error.array() });
    }

    const { skillName, proficiencyLevel } = req.body;
    const userId = req.user.userId;

    const newSkill = await Skill.create({
      skillName,
      proficiencyLevel,
      userId,
    });

    res.status(201).json({ message: "Skill added successfully", skill: newSkill });
  } catch (err) {
    console.error("Error adding skill:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all skills for a user
export const getSkills = async (req, res) => {
  try {
    const userId = req.params.userId;
    const skills = await Skill.find( userId );
    res.status(200).json({ skills });
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ message: "Error fetching skills", error: err });
  }
};

// Update skill by ID
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSkill = await Skill.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedSkill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.status(200).json({ success: true, message: "Skill updated", skill: updatedSkill });
  } catch (err) {
    console.error("Error updating skill:", err);
    res.status(500).json({ success: false, message: "Update failed", error: err });
  }
};

// Delete skill by ID
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Skill.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ success: false, message: "Deletion failed", error });
  }
};
