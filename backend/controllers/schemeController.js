const Scheme = require('../models/Scheme');
const User = require('../models/User');

// --- NEW, CORRECTED ELIGIBILITY ALGORITHM ---
const calculateMatchPercentage = (scheme, profile) => {
  const rules = scheme.eligibility;
  let score = 0;
  let maxScore = 0;

  // --- Rule 1: Age ---
  if (rules.ageMin || rules.ageMax) {
    maxScore++;
    if (profile.age >= (rules.ageMin || 0) && profile.age <= (rules.ageMax || 150)) {
      score++;
    }
  }

  // --- Rule 2: Income ---
  // The scheme rule is "annualIncomeMax" (e.g., 100000)
  // The user matches if their income (e.g., 50000) is LESS THAN or EQUAL to the max.
  if (rules.annualIncomeMax) {
    maxScore++;
    if ((profile.annualIncome || 0) <= rules.annualIncomeMax) {
      score++;
    }
  }

  // --- Rule 3: State ---
  // This rule only counts if the scheme specifies a state (and not 'Any')
  if (rules.state && rules.state !== 'Any' && rules.state !== '') {
    maxScore++;
    if (rules.state === profile.state) {
      score++;
    }
  }

  // --- Rule 4: Gender ---
  if (rules.gender && rules.gender !== 'Any' && rules.gender !== '') {
    maxScore++;
    if (rules.gender === profile.gender) {
      score++;
    }
  }

  // --- Rule 5: Caste Category ---
  if (rules.casteCategory && rules.casteCategory !== 'Any' && rules.casteCategory !== '') {
    maxScore++;
    if (rules.casteCategory === profile.casteCategory) {
      score++;
    }
  }

  // --- Rule 6: Occupation ---
  if (rules.occupation && rules.occupation !== 'Any' && rules.occupation !== '') {
    maxScore++;
    if (rules.occupation === profile.occupation) {
      score++;
    }
  }

  // --- Rule 7: BPL Status ---
  if (rules.requiresBPL) {
    maxScore++;
    if (profile.isBPL) { // if rule is true, user must be true
      score++;
    }
  }

  // --- Rule 8: Disability Status ---
  if (rules.requiresDisability) {
    maxScore++;
    if (profile.isDisabed) { // if rule is true, user must be true
      score++;
    }
  }

  // --- Rule 9: Education Level ---
  if (rules.educationLevelMin && rules.educationLevelMin > 0) {
    maxScore++;
    // User's education level (e.g., 4) must be >= the minimum (e.g., 3)
    if ((profile.educationLevel || 0) >= rules.educationLevelMin) {
      score++;
    }
  }

  // If a scheme has 0 rules, it's a 100% match for everyone
  if (maxScore === 0) return 100; 

  return Math.round((score / maxScore) * 100);
};
// --- END OF NEW ALGORITHM ---


// @desc    Get all schemes
// @route   GET /api/schemes
// @access  Public
exports.getAllSchemes = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1; 

    const { search, state, category, occupation } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) {
      query['eligibility.state'] = { $in: [state, null, '', 'Any'] };
    }
    if (category) {
      query['eligibility.casteCategory'] = { $in: [category, null, '', 'Any'] };
    }
    if (occupation) {
      query['eligibility.occupation'] = { $in: [occupation, null, '', 'Any'] };
    }

    const count = await Scheme.countDocuments(query);

    const schemes = await Scheme.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      schemes,
      page,
      pages: Math.ceil(count / pageSize),
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ msg: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Scheme not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private (Admin)
exports.createScheme = async (req, res) => {
  const {
    title,
    description,
    department,
    schemeType,
    officialLink,
    eligibility,
    benefits,
    howToApply,
    documentsRequired,
    formFields,
  } = req.body;

  try {
    const newScheme = new Scheme({
      title,
      description,
      department,
      schemeType,
      officialLink: schemeType === 'Government' ? officialLink : null,
      eligibility,
      benefits,
      howToApply,
      documentsRequired,
      formFields: formFields || [],
      postedBy: req.user.id,
    });

    const scheme = await newScheme.save();
    res.status(201).json(scheme);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a scheme
// @route   PUT /api/schemes/:id
// @access  Private (Admin)
exports.updateScheme = async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ msg: 'Scheme not found' });
    }

    scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(scheme);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a scheme
// @route   DELETE /api/schemes/:id
// @access  Private (Admin)
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(4404).json({ msg: 'Scheme not found' });
    }
    await scheme.remove();
    res.json({ msg: 'Scheme removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get schemes based on user eligibility, sorted by match %
// @route   GET /api/schemes/eligible
// @access  Private (Citizen)
exports.getEligibleSchemes = async (req, res) => {
  try {
    const profile = req.user.profile;

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'Please update your profile to check eligibility.' });
    }
    
    // Fetch ALL schemes to calculate percentage
    const allSchemes = await Scheme.find({});

    // Calculate match percentage for each scheme
    const schemesWithMatch = allSchemes.map(scheme => {
      const matchPercentage = calculateMatchPercentage(scheme, profile);
      
      return {
        ...scheme.toObject(), 
        matchPercentage: matchPercentage,
      };
    });

    // Sort schemes by match percentage (highest first)
    const sortedSchemes = schemesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    res.json(sortedSchemes); 

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};