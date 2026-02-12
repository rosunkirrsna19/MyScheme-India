const User = require('../models/User');
const SavedScheme = require('../models/SavedScheme');
const Scheme = require('../models/Scheme');

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateMyProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    age,
    state,
    gender,
    occupation,
    annualIncome,
    casteCategory,
    // --- NEW FIELDS ---
    isDisabed,
    isBPL,
    educationLevel,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.profile = {
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      age: age || user.profile.age,
      state: state || user.profile.state,
      gender: gender || user.profile.gender,
      occupation: occupation || user.profile.occupation,
      annualIncome: annualIncome || user.profile.annualIncome,
      casteCategory: casteCategory || user.profile.casteCategory,
      // --- NEW FIELDS ---
      isDisabed: isDisabed, // Pass boolean directly
      isBPL: isBPL,       // Pass boolean directly
      educationLevel: educationLevel || user.profile.educationLevel,
    };

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- THIS IS THE FUNCTION THAT WAS MISSING ---
// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ msg: 'Please provide both old and new passwords' });
  }

  try {
    // We need to select '+password' because it's hidden by default
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if old password matches
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials: Old password does not match' });
    }

    // Set new password
    user.password = newPassword;
    
    // The pre-save hook in User.js will automatically hash it
    await user.save(); 

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// --- END OF NEW FUNCTION ---


// @desc    Save a scheme
// @route   POST /api/users/save-scheme
// @access  Private
exports.saveScheme = async (req, res) => {
  const { schemeId } = req.body;
  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ msg: 'Scheme not found' });
    }

    let saved = await SavedScheme.findOne({ user: req.user.id, scheme: schemeId });
    if (saved) {
      return res.status(400).json({ msg: 'Scheme already saved' });
    }

    saved = new SavedScheme({
      user: req.user.id,
      scheme: schemeId,
    });

    await saved.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get logged-in user's saved schemes
// @route   GET /api/users/saved-schemes
// @access  Private
exports.getSavedSchemes = async (req, res) => {
  try {
    const savedSchemes = await SavedScheme.find({ user: req.user.id }).populate('scheme');
    res.json(savedSchemes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Remove a saved scheme
// @route   DELETE /api/users/saved-schemes/:id
// @access  Private
exports.removeSavedScheme = async (req, res) => {
  try {
    const savedScheme = await SavedScheme.findById(req.params.id);

    if (!savedScheme) {
      return res.status(404).json({ msg: 'Saved scheme not found' });
    }

    if (savedScheme.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await savedScheme.remove();
    res.json({ msg: 'Saved scheme removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};