/**
 * languages.js
 * ─────────────────────────────────────────────────────────────
 * Master language registry for the translation system.
 *
 * Standard languages use the ISO 639-1 codes that Google Cloud
 * Translation API (and most other providers) recognise directly.
 *
 * Non-standard regional dialects (Bundeli, Bagheli, Malvi, Nimadi)
 * are not in any translation API's catalogue — they are closely
 * related to Hindi, so we:
 *   1. Route their API call to Hindi ('hi').
 *   2. Apply a lightweight word-substitution layer on top via
 *      `dialectPatch` maps defined below, which you can expand.
 */

const LANGUAGES = {
  en:   { name: 'English',    apiCode: 'en',   isDialect: false },
  hi:   { name: 'Hindi',      apiCode: 'hi',   isDialect: false },
  mr:   { name: 'Marathi',    apiCode: 'mr',   isDialect: false },
  gu:   { name: 'Gujarati',   apiCode: 'gu',   isDialect: false },
  bn:   { name: 'Bengali',    apiCode: 'bn',   isDialect: false },
  ta:   { name: 'Tamil',      apiCode: 'ta',   isDialect: false },
  te:   { name: 'Telugu',     apiCode: 'te',   isDialect: false },
  kn:   { name: 'Kannada',    apiCode: 'kn',   isDialect: false },
  pa:   { name: 'Punjabi',    apiCode: 'pa',   isDialect: false },
  ur:   { name: 'Urdu',       apiCode: 'ur',   isDialect: false },
  or:   { name: 'Odia',       apiCode: 'or',   isDialect: false },
  ml:   { name: 'Malayalam',  apiCode: 'ml',   isDialect: false },
  sa:   { name: 'Sanskrit',   apiCode: 'sa',   isDialect: false },

  // ── Regional dialects ─────────────────────────────────────────────────────
  // These do not exist in any translation API; we translate to Hindi
  // and then apply a rule-based word-substitution patch.
  bund: { name: 'Bundeli',    apiCode: 'hi',   isDialect: true, baseCode: 'hi' },
  bag:  { name: 'Bagheli',    apiCode: 'hi',   isDialect: true, baseCode: 'hi' },
  mal:  { name: 'Malvi',      apiCode: 'hi',   isDialect: true, baseCode: 'hi' },
  nim:  { name: 'Nimadi',     apiCode: 'hi',   isDialect: true, baseCode: 'hi' },
};

/**
 * Word-substitution patches for regional dialects.
 * Format: { 'Hindi word': 'Dialect replacement' }
 *
 * Expand these maps with domain-specific vocabulary as required.
 * These run AFTER the API translation, so keys must be in Hindi.
 */
const DIALECT_PATCHES = {
  bund: {
    'सरकार':    'सरकार',
    'योजना':    'योजना',
    'आवेदन':    'अरजी',
    'लाभार्थी': 'हितग्राही',
    'किसान':    'किसान',
  },
  bag: {
    'आवेदन':    'अरजी',
    'लाभार्थी': 'हितग्राही',
    'प्रमाण पत्र': 'कागज',
  },
  mal: {
    'आवेदन':    'अरज',
    'सरकार':    'सरकार',
    'समिति':    'पंचायत',
  },
  nim: {
    'आवेदन':    'अरजी',
    'लाभार्थी': 'हितग्राही',
    'मंत्रालय': 'मंत्री घर',
  },
};

const DEFAULT_LANGUAGE  = 'en';
const SUPPORTED_CODES   = new Set(Object.keys(LANGUAGES));

module.exports = {
  LANGUAGES,
  DIALECT_PATCHES,
  DEFAULT_LANGUAGE,
  SUPPORTED_CODES,
};
