import Membership from '../model/Membership.model.js';

import Project from '../model/Project.model.js';

// 📋 Get accepted members of a project
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const members = await Membership.find({ projectId, status: 'accepted' })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      members: members.map(m => ({
        membershipId: m._id,
        role: m.role,
        status: m.status,
        joinedAt: m.createdAt,
        user: m.userId,
      })),
    });
  } catch (err) {
    console.error('Error fetching project members:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 📋 Get all projects a user has joined (accepted)
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const memberships = await Membership.find({ userId, status: 'accepted' })
      .populate({
        path: 'projectId',
        populate: { path: 'created_by', select: 'name email' }
      });

    const projects = memberships.map(m => m.projectId);
    res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error('Error fetching user projects:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🧹 Remove a member (only creator/admin)
export const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const requester = req.user._id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check permissions
    if (project.created_by.toString() !== requester.toString()) {
      const reqMembership = await Membership.findOne({ projectId, userId: requester });
      if (!reqMembership || reqMembership.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to remove members' });
      }
    }

    const deleted = await Membership.findOneAndDelete({ projectId, userId });
    if (!deleted) return res.status(404).json({ message: 'Member not found' });

    res.status(200).json({ success: true, message: 'Member removed from project' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🎖 Change a member’s role
export const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const requester = req.user._id;
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const reqMembership = await Membership.findOne({ projectId, userId: requester });
    if (
      project.created_by.toString() !== requester.toString() &&
      (!reqMembership || reqMembership.role !== 'admin')
    ) {
      return res.status(403).json({ message: 'Not authorized to update roles' });
    }

    if (role === 'admin' && project.created_by.toString() !== requester.toString()) {
      return res.status(403).json({ message: 'Only project creator can assign admins' });
    }

    const mem = await Membership.findOne({ projectId, userId });
    if (!mem) return res.status(404).json({ message: 'Membership not found' });
    mem.role = role;
    await mem.save();

    res.status(200).json({ success: true, message: 'Role updated successfully' });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🚪 Leave project (self remove)
export const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.created_by.toString() === userId.toString()) {
      return res.status(403).json({ message: 'Creator cannot leave their own project' });
    }

    const deleted = await Membership.findOneAndDelete({ projectId, userId, status: 'accepted' });
    if (!deleted) return res.status(404).json({ message: 'You are not a member of this project' });

    res.status(200).json({ success: true, message: 'You have left the project' });
  } catch (err) {
    console.error('Error leaving project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
