const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');

// @desc    Get stats for admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const schemeCount = await Scheme.countDocuments();
    const applicationCount = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers: userCount,
      totalSchemes: schemeCount,
      totalApplications: applicationCount,
      pendingApplications: pendingApplications,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};
// @desc    Get application counts grouped by status
// @route   GET /api/admin/stats/application-status
exports.getApplicationStatsByStatus = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);
    const statuses = ['Pending', 'Approved', 'Rejected', 'More Info Required'];
    const dataMap = new Map(stats.map(s => [s.name, s.value]));
    const finalStats = statuses.map(status => ({
        name: status,
        value: dataMap.get(status) || 0
    }));
    res.json(finalStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get scheme counts grouped by department
// @route   GET /api/admin/stats/scheme-department
exports.getSchemeStatsByDepartment = async (req, res) => {
  try {
    const stats = await Scheme.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: '$count', _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION ---
// @desc    Get all users with role 'Coordinator'
// @route   GET /api/admin/coordinators
// @access  Private (Admin)
exports.getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'Coordinator' }).select('username email');
    res.json(coordinators);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// --- END NEW FUNCTION ---
// @desc    Update a user's role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  const validRoles = ['Citizen', 'Admin', 'Coordinator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role specified' });
  }

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'Admin' && user.id === req.user.id) {
       const adminCount = await User.countDocuments({ role: 'Admin' });
       if(adminCount <= 1) {
            return res.status(400).json({ msg: 'Cannot change role of the only admin' });
       }
    }

    user.role = role;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if(user.id === req.user.id) {
        return res.status(400).json({ msg: 'Cannot delete your own admin account' });
    }
    
    await user.remove();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION 1: FOR PIE CHART ---
// @desc    Get application counts grouped by status
// @route   GET /api/admin/stats/application-status
// @access  Private (Admin)
exports.getApplicationStatsByStatus = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status', // Group by the 'status' field
          count: { $sum: 1 }, // Count the documents in each group
        },
      },
      {
        $project: {
          name: '$_id', // Rename '_id' to 'name' (for Recharts)
          value: '$count', // Rename 'count' to 'value' (for Recharts)
          _id: 0, // Hide the original '_id'
        },
      },
    ]);

    // Ensure all statuses are present, even if count is 0
    const statuses = ['Pending', 'Approved', 'Rejected'];
    const dataMap = new Map(stats.map(s => [s.name, s.value]));
    const finalStats = statuses.map(status => ({
        name: status,
        value: dataMap.get(status) || 0
    }));

    res.json(finalStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION 2: FOR BAR CHART ---
// @desc    Get scheme counts grouped by department
// @route   GET /api/admin/stats/scheme-department
// @access  Private (Admin)
exports.getSchemeStatsByDepartment = async (req, res) => {
  try {
    const stats = await Scheme.aggregate([
      {
        $group: {
          _id: '$department', // Group by the 'department' field
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          count: '$count',
          _id: 0,
        },
      },
      {
        $sort: { count: -1 }, // Sort by most popular department
      },
    ]);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};