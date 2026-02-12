const { check, validationResult } = require('express-validator');

// Validation rules for registration
exports.registerRules = () => [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
];

// Validation rules for login
exports.loginRules = () => [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

// Middleware to handle the validation result
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};