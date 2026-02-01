import express from 'express';
import { requireAdminAuth } from '../middleware/adminAuth.js';
import ActivityLog from '../models/activityLogs.js';
import User from '../models/user.js';

const router = express.Router();

// Hardcoded credentials for simplicity
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// 🔐 Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Logged in as admin' }); // ✅ added `success: true`
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});


// 🔐 Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// 🔍 Check if admin is authenticated (for frontend)
router.get('/check-auth', (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.json({ isAuthenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// ✅ Total pending logs
router.get('/logs/pending', requireAdminAuth, async (req, res) => {
  try {
    const count = await ActivityLog.countDocuments({ Status: 'Pending' });
    res.json({ count });
  } catch (error) {
    console.error('Error getting pending logs:', error);
    res.status(500).json({ message: 'Error fetching pending logs' });
  }
});

// ✅ Total users count
router.get('/users/count', requireAdminAuth, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Error fetching user count' });
  }
});

// 🚦 New: Get all logs with Status = "Pending" or "Manual_Review"
router.get('/logs/pending-logs', requireAdminAuth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ Status: { $in: ['Pending', 'Manual_Review'] } })
      .sort({ logTime: -1 }) // newest first
      .lean(); // get plain JS objects

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching pending/manual review logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// 🚦 New: Approve or Reject a log by ID
router.patch('/logs/:id/verify', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // expected 'Approved' or 'Rejected'

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const log = await ActivityLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Update status and points accordingly
    log.Status = status;
    if (status === 'Approved') {
      log.points = log.maxPoints || 0;
    } else if (status === 'Rejected') {
      log.points = 0;
    }

    // Save updated log
    await log.save();

    res.json({ message: `Log ${status.toLowerCase()} successfully`, log });
  } catch (error) {
    console.error('Error verifying log:', error);
    res.status(500).json({ message: 'Error updating log status' });
  }
});

// GET /api/admin/users?search=abc  => search users by username or user ID
router.get('/users', requireAdminAuth, async (req, res) => {
  const { search } = req.query;
  try {
    const query = {};
    if (search) {
      // Search username or _id (user id)
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { uid: search },
      ];
    }
    
    const users = await User.find(query)
      .select('_id uid fullName email')
      .limit(50)
      .lean();

    // Calculate total points for each user from ActivityLogs
    const usersWithPoints = await Promise.all(
      users.map(async (user) => {
        const logs = await ActivityLog.find({ uid: user.uid }).lean();
        const totalPoints = logs.reduce((sum, log) => sum + (log.points || 0), 0);
        const activityCount = logs.length;
        
        return {
          ...user,
          totalPoints,
          activityCount,
          username: user.fullName || user.email?.split('@')[0] || 'No Name'
        };
      })
    );

    res.json({ users: usersWithPoints });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET /api/admin/users/:id/logs  => get all logs for user ID
router.get('/users/:id/logs', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await ActivityLog.find({ uid: id })
      .sort({ logTime: -1 })
      .lean();
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Error fetching user logs' });
  }
});

// PATCH /api/admin/logs/:id/edit-points => edit points for an activity
router.patch('/logs/:id/edit-points', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  if (typeof points !== 'number' || points < 0) {
    return res.status(400).json({ message: 'Invalid points value' });
  }

  try {
    const log = await ActivityLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    log.points = points;
    await log.save();

    res.json({ message: 'Points updated successfully', log });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ message: 'Error updating points' });
  }
});

// DELETE /api/admin/logs/:id => completely reject/delete an activity
router.delete('/logs/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const log = await ActivityLog.findByIdAndDelete(id);
    if (!log) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Error deleting activity' });
  }
});



// 🔐 Example protected route
router.get('/dashboard', requireAdminAuth, (req, res) => {
  res.json({ message: 'Welcome to admin dashboard!' });
});

export default router;
