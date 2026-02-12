const Application = require('../models/Application');
const Scheme = require('../models/Scheme');

// @desc    Submit a new application for a private scheme
// @route   POST /api/applications
// @access  Private (Citizen)
exports.submitApplication = async (req, res) => {
  // When using 'upload.array', text fields are in 'req.body'
  // and files are in 'req.files'
  const { schemeId, formData: formDataString } = req.body;

  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ msg: 'Scheme not found' });
    }

    if (scheme.schemeType !== 'Private') {
      return res
        .status(400)
        .json({ msg: 'This is a government scheme, please apply on the official website.' });
    }

    const existingApplication = await Application.findOne({
      citizen: req.user.id,
      scheme: schemeId,
    });
    
    if (existingApplication && existingApplication.status !== 'More Info Required') {
      return res
        .status(400)
        .json({ msg: `You have already applied for this scheme. Your status is: ${existingApplication.status}` });
    }

    // --- NEW: Process Dynamic Form Data and Files ---
    
    // 1. Parse the JSON string of text-based answers
    let formData;
    try {
      formData = JSON.parse(formDataString);
    } catch (err) {
       return res.status(400).json({ msg: 'Invalid formData format. Must be a JSON object string.' });
    }

    // 2. Process uploaded files
    const legacyDocuments = []; // For the old 'documents' array
    if (req.files) {
      req.files.forEach(file => {
        const filePath = `/uploads/documents/${file.filename}`;
        
        // Add to the new dynamic formData
        // 'file.fieldname' will be the 'label' from the form, e.g., "proofOfResidence"
        formData[file.fieldname] = filePath; 
        
        // Also add to the old 'documents' array for backward compatibility
        legacyDocuments.push(filePath);
      });
    }
    // --- END NEW LOGIC ---


    if (existingApplication && existingApplication.status === 'More Info Required') {
      // --- This is a RE-SUBMISSION ---
      existingApplication.formData = formData; // Store the new data
      
      if (legacyDocuments.length > 0) {
        existingApplication.documents = legacyDocuments; // Replace old files
      }
      
      existingApplication.status = 'Pending'; 
      existingApplication.coordinatorNotes = '';
      
      const updatedApplication = await existingApplication.save();
      return res.status(200).json(updatedApplication);

    } else {
      // --- This is a NEW application ---
      const newApplication = new Application({
        citizen: req.user.id,
        scheme: schemeId,
        formData: formData, // Store the dynamic form data
        documents: legacyDocuments, // Store files in the old array
        status: 'Pending',
      });

      const application = await newApplication.save();
      return res.status(201).json(application);
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all applications submitted by the logged-in user
// @route   GET /api/applications/my
// @access  Private (Citizen)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ citizen: req.user.id })
      .populate('scheme', 'title description')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};