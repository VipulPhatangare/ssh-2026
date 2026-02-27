/**
 * jsonTranslator.js
 * ─────────────────────────────────────────────────────────────
 * Recursively walks any JSON-serialisable value and translates
 * every string leaf, while preserving the full original structure.
 *
 * Key design decisions:
 *
 *  • FLAT COLLECTION first — before making any API call, the
 *    walker visits EVERY node and collects all string values
 *    into a single flat array.  One translateBatch() call is
 *    then made for the entire object.  This means one HTTP
 *    request per response, regardless of nesting depth.
 *
 *  • SKIP KEYS list — field names that must NOT be translated
 *    (IDs, URLs, codes, dates, enum values, etc.).
 *
 *  • SKIP PATTERNS — regex list for string VALUES that should
 *    not be translatable (URLs, ISO dates, numeric strings, etc.).
 *
 *  • Structure is rebuilt from the original using the same
 *    traversal order, replacing string leaves with translations.
 */

const { translateBatch } = require('../services/translationService');

/* ── Keys whose VALUES must never be translated ────────────────────────────── */
const SKIP_KEYS = new Set([
  '_id', 'id', '__v',
  'email', 'phone', 'mobile',
  'url', 'link', 'href', 'src', 'image', 'icon',
  'schemeId', 'schemeCode', 'code', 'slug',
  'createdAt', 'updatedAt', 'date', 'dob',
  'lat', 'lng', 'latitude', 'longitude',
  'token', 'password', 'hash',
  'status',           // typically an enum — keep English
  'type', 'category', // often enum — add/remove as needed
]);

/* ── Patterns for VALUES that must never be translated ─────────────────────── */
const SKIP_VALUE_PATTERNS = [
  /^https?:\/\//i,               // URLs
  /^\d{4}-\d{2}-\d{2}/,          // ISO dates 2024-01-15...
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,  // email
  /^\+?[0-9\s\-().]{7,}$/,       // phone numbers
  /^[0-9,.\s]+$/,                // pure numbers / comma-numbers
  /^#[0-9a-fA-F]{3,8}$/,         // hex colours
  /^[A-Z0-9_]{2,20}$/,           // ALL_CAPS codes / IDs
];

/**
 * Returns true if a string value should be skipped.
 * @param {string} key   The parent object's key name.
 * @param {string} value The string value.
 */
function _shouldSkip(key, value) {
  if (typeof value !== 'string') return false;
  if (SKIP_KEYS.has(key))        return true;
  if (value.trim().length === 0) return true;
  for (const pattern of SKIP_VALUE_PATTERNS) {
    if (pattern.test(value.trim())) return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHASE 1 — COLLECT
   Walk the value tree and push every translatable string into `strings[]`.
   Record the "address" (path) of each leaf for reconstruction.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {*}        node      Any JSON-serialisable value.
 * @param {string}   parentKey The key name of this node in its parent object.
 * @param {string[]} strings   Accumulator — all strings discovered so far.
 * @param {number[]} indices   Parallel array — index in `strings` for each leaf.
 *                             (We keep this separate to allow reconstruction.)
 * @returns {*} A "skeleton" tree where translatable strings are replaced
 *              with their index into `strings` (as a special marker object
 *              `{ __tIdx: N }`).
 */
function _collect(node, parentKey, strings) {
  if (node === null || node === undefined) return node;

  if (typeof node === 'string') {
    if (_shouldSkip(parentKey, node)) return node;   // keep original
    const idx = strings.length;
    strings.push(node);
    return { __tIdx: idx };                          // marker
  }

  if (Array.isArray(node)) {
    return node.map(item => _collect(item, parentKey, strings));
  }

  if (typeof node === 'object') {
    const skeleton = {};
    for (const [key, val] of Object.entries(node)) {
      skeleton[key] = SKIP_KEYS.has(key)
        ? val                                        // copy as-is
        : _collect(val, key, strings);
    }
    return skeleton;
  }

  // number | boolean — pass through
  return node;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHASE 2 — RECONSTRUCT
   Walk the skeleton tree.  Replace every `{ __tIdx: N }` marker with
   the corresponding translated string from `translations[N]`.
═══════════════════════════════════════════════════════════════════════════ */

function _reconstruct(skeleton, translations) {
  if (skeleton === null || skeleton === undefined) return skeleton;

  // Marker check
  if (typeof skeleton === 'object' && '__tIdx' in skeleton) {
    return translations[skeleton.__tIdx];
  }

  if (Array.isArray(skeleton)) {
    return skeleton.map(item => _reconstruct(item, translations));
  }

  if (typeof skeleton === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(skeleton)) {
      result[key] = _reconstruct(val, translations);
    }
    return result;
  }

  return skeleton;   // primitives
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Translate an entire JSON-serialisable value in one round-trip.
 *
 * @param {*}      data      The original English data (object, array, or string).
 * @param {string} langCode  Target language code (e.g. 'hi', 'ta', 'bund').
 * @returns {Promise<*>}     Deep clone with all translatable strings replaced.
 *
 * @example
 *   const translated = await translateJson(scheme, 'hi');
 *   res.render('scheme', { scheme: translated, lng: 'hi' });
 */
async function translateJson(data, langCode) {
  const strings  = [];                       // flat list of strings to translate
  const skeleton = _collect(data, '', strings);

  if (!strings.length) return data;          // nothing translatable

  const translations = await translateBatch(strings, langCode);

  return _reconstruct(skeleton, translations);
}

module.exports = { translateJson };
