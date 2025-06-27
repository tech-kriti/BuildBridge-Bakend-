import Project from "../model/Project.model.js";
import Technology from "../model/Technology.model.js";
import User from "../model/user.model.js";
import Membership from "../model/Membership.model.js";
import { validationResult } from "express-validator";

// Create Project
export const createProject = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: "Validation error", error: error.array() });
    }

    const { title, description, technical_stack, deadline, members_needed, technologyIds } = req.body;
    const created_by = req.user.userId;

    const project = await Project.create({
      title,
      description,
      technical_stack,
      deadline,
      members_needed,
      created_by,
      technologies: technologyIds || [],
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("created_by", "id name email")
      .populate("technologies", "id name");

    res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Project By ID
export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id)
      .populate("created_by", "id name email")
      .populate("technologies", "id name");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    console.error("Error fetching project by id:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, technical_stack, deadline, members_needed, technologyIds } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    project.title = title;
    project.description = description;
    project.technical_stack = technical_stack;
    project.deadline = deadline;
    project.members_needed = members_needed;
    if (technologyIds && Array.isArray(technologyIds)) {
      project.technologies = technologyIds;
    }

    await project.save();

    res.status(200).json({ success: true, message: "Project updated successfully", project });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  const project_id = req.params.id;
  const userId = req.user.userId;

  try {
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.created_by.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete" });
    }

    await project.deleteOne();

    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get My Projects (Created and Joined)
export const getMyProjects = async (req, res) => {
  const userId = req.user.userId;

  try {
    const createdProjects = await Project.find({ created_by: userId }).populate("technologies");

    const joinedMemberships = await Membership.find({ userId, status: "accepted" }).populate({
      path: "project_id",
      populate: { path: "technologies" },
    });

    const joinedProjects = joinedMemberships
      .filter(m => m.project_id) // avoid nulls
      .map(m => m.project_id);

    res.status(200).json({ success: true, createdProjects, joinedProjects });
  } catch (err) {
    console.error("Error fetching my projects:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Technologies
export const getAllTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find();
    res.status(200).json({ technologies });
  } catch (err) {
    console.error("Error fetching technologies:", err);
    res.status(500).json({ message: "Failed to fetch technologies" });
  }
};
