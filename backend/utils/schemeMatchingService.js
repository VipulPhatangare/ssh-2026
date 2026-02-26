const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const Document = require('../models/Document');

/**
 * Calculate match score for a scheme based on user profile
 */
const calculateMatchScore = (user, scheme) => {
  let score = 0;
  let maxScore = 0;

  // Age eligibility (25 points)
  maxScore += 25;
  if (user.age >= scheme.eligibility.ageMin && user.age <= scheme.eligibility.ageMax) {
    score += 25;
  }

  // Income eligibility (25 points)
  maxScore += 25;
  if (!scheme.eligibility.incomeMax || user.annualIncome <= scheme.eligibility.incomeMax) {
    score += 25;
  }

  // Caste category (20 points)
  maxScore += 20;
  if (scheme.eligibility.casteCategories.includes('All') || 
      scheme.eligibility.casteCategories.includes(user.casteCategory)) {
    score += 20;
  }

  // Gender (15 points)
  maxScore += 15;
  if (scheme.eligibility.gender.includes('All') || 
      scheme.eligibility.gender.includes(user.gender)) {
    score += 15;
  }

  // Occupation (15 points)
  maxScore += 15;
  if (scheme.eligibility.occupations.includes('All') || 
      scheme.eligibility.occupations.includes(user.occupation)) {
    score += 15;
  }

  return Math.round((score / maxScore) * 100);
};

/**
 * Find eligible schemes for a user
 */
const findEligibleSchemes = async (user) => {
  try {
    // Get all active schemes
    const allSchemes = await Scheme.find({ isActive: true });

    // Calculate match score for each scheme
    const schemesWithScores = allSchemes.map(scheme => ({
      scheme: scheme.toObject(),
      matchScore: calculateMatchScore(user, scheme),
      isEligible: calculateMatchScore(user, scheme) === 100
    }));

    // Filter only eligible schemes (100% match)
    const eligibleSchemes = schemesWithScores.filter(s => s.isEligible);

    // Sort by match score
    const sortedSchemes = schemesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return {
      eligible: eligibleSchemes,
      all: sortedSchemes
    };
  } catch (error) {
    throw new Error('Error finding eligible schemes');
  }
};

/**
 * Find unclaimed schemes (eligible but not applied)
 */
const findUnclaimedSchemes = async (userId, user) => {
  try {
    // Get all eligible schemes
    const { eligible } = await findEligibleSchemes(user);

    // Get user's applications
    const applications = await Application.find({ userId });
    const appliedSchemeIds = applications.map(app => app.schemeId.toString());

    // Filter unclaimed schemes
    const unclaimedSchemes = eligible.filter(
      item => !appliedSchemeIds.includes(item.scheme._id.toString())
    );

    return unclaimedSchemes;
  } catch (error) {
    throw new Error('Error finding unclaimed schemes');
  }
};

/**
 * Check document availability for a scheme
 */
const checkDocumentAvailability = async (userId, requiredDocuments) => {
  try {
    const userDocuments = await Document.find({ userId });
    const userDocumentTypes = userDocuments.map(doc => doc.documentType);

    const availability = requiredDocuments.map(docType => ({
      documentType: docType,
      available: userDocumentTypes.includes(docType)
    }));

    const allAvailable = availability.every(doc => doc.available);
    const missingDocuments = availability.filter(doc => !doc.available).map(doc => doc.documentType);

    return {
      allAvailable,
      availability,
      missingDocuments
    };
  } catch (error) {
    throw new Error('Error checking document availability');
  }
};

/**
 * Get schemes by life event
 */
const getSchemesByLifeEvent = async (lifeEvent) => {
  try {
    const schemes = await Scheme.find({ 
      lifeEvents: lifeEvent,
      isActive: true 
    });
    return schemes;
  } catch (error) {
    throw new Error('Error getting schemes by life event');
  }
};

/**
 * Check for document expiry alerts
 */
const checkDocumentExpiry = async (userId) => {
  try {
    const userDocuments = await Document.find({ userId });
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringDocuments = userDocuments.filter(doc => {
      if (!doc.expiryDate) return false;
      return doc.expiryDate <= thirtyDaysFromNow && doc.expiryDate >= currentDate;
    });

    const expiredDocuments = userDocuments.filter(doc => {
      if (!doc.expiryDate) return false;
      return doc.expiryDate < currentDate;
    });

    return {
      expiringDocuments,
      expiredDocuments
    };
  } catch (error) {
    throw new Error('Error checking document expiry');
  }
};

module.exports = {
  calculateMatchScore,
  findEligibleSchemes,
  findUnclaimedSchemes,
  checkDocumentAvailability,
  getSchemesByLifeEvent,
  checkDocumentExpiry
};
