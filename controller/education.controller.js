import Education from "../model/Education.model.js";
import { validationResult } from "express-validator";

// Add Education
export const addEducation = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: "Bad request", error: error.array() });
    }

    const { institution_name, degree, field_of_study, start_date, end_date } = req.body;
    const userId = req.user.userId;

    const education = await Education.create({
      institution_name,
      degree,
      field_of_study,
      start_date,
      end_date,
      userId,
    });

    res.status(201).json({ message: "Education added successfully", education });
  } catch (err) {
    console.error("Error adding education:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Education for a User
export const getEducation = async (req, res) => {
  try {
    const userId = req.params.userId;

    const educations = await Education.find({ userId });

    res.status(200).json({ message: "Fetched successfully", education: educations });
  } catch (err) {
    console.error("Error fetching education:", err);
    res.status(500).json({ message: "Error fetching education", error: err });
  }
};

// Update Education by ID
export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Education.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Education not found" });
    }

    res.status(200).json({ success: true, message: "Education updated", education: updated });
  } catch (err) {
    console.error("Error updating education:", err);
    res.status(500).json({ success: false, message: "Update failed", error: err });
  }
};

// Delete Education by ID
export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Education.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Education not found" });
    }

    res.json({ success: true, message: "Education deleted" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ success: false, message: "Deletion failed", error });
  }
};
