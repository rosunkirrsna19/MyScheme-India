const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const User = require('../models/User');

// --- NEW HELPER FUNCTION ---
// Gets an array of Scheme IDs assigned to the logged-in coordinator
const getAssignedSchemeIds = async (coordinatorId) => {
  const assignedSchemes = await Scheme.find({ assignedTo: coordinatorId }).select('_id');
  return assignedSchemes.map(s => s._id);
};

// @desc    Get stats for coordinator dashboard
// @route   GET /api/coordinator/dashboard
// @access  Private (Coordinator)
exports.getCoordinatorDashboardStats = async (req, res) => {
  try {
    // --- UPDATED: Only get stats for assigned schemes ---
    const schemeIds = await getAssignedSchemeIds(req.user.id);
    
    const pendingCount = await Application.countDocuments({ 
      status: 'Pending', 
      scheme: { $in: schemeIds } 
    });
    const approvedCount = await Application.countDocuments({
      reviewedBy: req.user.id,
      status: 'Approved',
      scheme: { $in: schemeIds }
    });
    const rejectedCount = await Application.countDocuments({
      reviewedBy: req.user.id,
      status: 'Rejected',
      scheme: { $in: schemeIds }
    });
    const totalReviewedByMe = approvedCount + rejectedCount;

    res.json({
      pendingCount,
      approvedCount,
      rejectedCount,
      totalReviewedByMe,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all applications with 'Pending' status
// @route   GET /api/coordinator/applications/pending
// @access  Private (Coordinator)
exports.getPendingApplications = async (req, res) => {
  try {
    // --- UPDATED: Only get applications for assigned schemes ---
    const schemeIds = await getAssignedSchemeIds(req.user.id);

    const pendingApplications = await Application.find({ 
      status: 'Pending', 
      scheme: { $in: schemeIds } 
    })
      .populate('scheme', 'title')
      .populate('citizen', 'username email profile');

    res.json(pendingApplications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single application by its ID
// @route   GET /api/coordinator/applications/:id
// @access  Private (Coordinator)
exports.getApplicationById = async (req, res) => {
  try {
    const schemeIds = await getAssignedSchemeIds(req.user.id);
    const application = await Application.findById(req.params.id)
      .populate('scheme')
      .populate('citizen', 'username email profile');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // --- SECURITY CHECK ---
    // Ensure the coordinator is assigned to this scheme
    if (!schemeIds.some(id => id.equals(application.scheme._id))) {
      return res.status(403).json({ msg: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Approve, reject, or request info for an application
// @route   PUT /api/coordinator/applications/:id
// @access  Private (Coordinator)
exports.updateApplicationStatus = async (req, res) => {
  const { status, coordinatorNotes } = req.body;
  const { id } = req.params;

  const validStatuses = ['Approved', 'Rejected', 'More Info Required'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status provided.' });
  }

  try {
    const schemeIds = await getAssignedSchemeIds(req.user.id);
    let application = await Application.findById(id).populate('scheme', 'title');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // --- SECURITY CHECK ---
    if (!schemeIds.some(id => id.equals(application.scheme._id))) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    if (application.status === 'Approved' || application.status === 'Rejected') {
      return res.status(400).json({ msg: `Application is already ${application.status}` });
    }
    
    if ((status === 'Rejected' || status === 'More Info Required') && !coordinatorNotes) {
        return res.status(400).json({ msg: 'Notes are required to reject or request more info.' });
    }

    application.status = status;
    application.coordinatorNotes = coordinatorNotes || '';
    application.reviewedBy = req.user.id; 

    await application.save();

    // Create Notification
    let message = '';
    if (status === 'Approved') {
      message = `Your application for "${application.scheme.title}" has been Approved!`;
    } else if (status === 'Rejected') {
      message = `Your application for "${application.scheme.title}" has been Rejected.`;
    } else if (status === 'More Info Required') {
      message = `More information is required for your application for "${application.scheme.title}".`;
    }

    if (message) {
      // We must require Notification model here as it was defined *after* this file
      const Notification = require('../models/Notification');
      await new Notification({
        user: application.citizen,
        message: message,
        link: '/my-applications',
      }).save();
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all applications (with search)
// @route   GET /api/coordinator/applications/all
// @access  Private (Coordinator)
exports.getAllApplications = async (req, res) => {
  try {
    // --- UPDATED: Only get applications for assigned schemes ---
    const schemeIds = await getAssignedSchemeIds(req.user.id);
    const { search } = req.query;
    
    // Base query: must be for an assigned scheme
    let query = { scheme: { $in: schemeIds } };

    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id'); 

      const userIds = users.map(user => user._id);
      
      // Add search query: for an assigned scheme AND by a matching user
      query = { ...query, citizen: { $in: userIds } };
    }

    const applications = await Application.find(query)
      .populate('scheme', 'title')
      .populate('citizen', 'username email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};