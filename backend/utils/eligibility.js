// This file is intended to hold logic for the "Eligibility Checker"

/**
 * Checks if a user's profile matches a scheme's eligibility criteria.
 * @param {object} userProfile - The user's profile (e.g., { age: 25, state: 'Tamil Nadu' })
 * @param {object} schemeEligibility - The scheme's criteria (e.g., { ageMin: 18, ageMax: 30, state: 'Tamil Nadu' })
 * @returns {boolean} - True if eligible, false otherwise
 */
const checkEligibility = (userProfile, schemeEligibility) => {
  if (!userProfile || !schemeEligibility) {
    return false;
  }

  const { age, state, gender } = userProfile;
  const { ageMin, ageMax, state: schemeState, gender: schemeGender } = schemeEligibility;

  if (ageMin && age < ageMin) {
    return false;
  }
  if (ageMax && age > ageMax) {
    return false;
  }
  if (schemeState && state && schemeState.toLowerCase() !== state.toLowerCase()) {
    return false;
  }
  if (schemeGender && gender && schemeGender.toLowerCase() !== gender.toLowerCase()) {
    return false;
  }

  // If all checks pass
  return true;
};

module.exports = { checkEligibility };