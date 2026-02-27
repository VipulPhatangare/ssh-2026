/**
 * translationMiddleware.js
 * ─────────────────────────────────────────────────────────────
 * Express middleware that:
 *
 *  1. Reads ?lng= from the query string (falls back to 'en').
 *  2. Attaches `req.lng` and `res.locals.lng` so EJS templates
 *     can access the language code directly.
 *  3. Patches `res.json()` so JSON API responses are translated
 *     before being sent to the client.
 *  4. Patches `res.render()` so the `locals` object passed to
 *     an EJS template is translated before rendering.
 *
 * ─────────────────────────────────────────────────────────────
 * USAGE (server.js / app.js):
 *
 *   const translationMiddleware = require('./middleware/translationMiddleware');
 *   app.use(translationMiddleware);
 *
 * ─────────────────────────────────────────────────────────────
 * OPTING OUT (per route):
 *
 *   Use `res.noTranslate = true` BEFORE sending:
 *     res.noTranslate = true;
 *     res.json(data);
 *
 *   Use `{ skipTranslation: true }` in render options:
 *     res.render('template', { data, skipTranslation: true });
 *
 * ─────────────────────────────────────────────────────────────
 * SELECTIVE FIELD TRANSLATION (per route):
 *
 *   Set `res.translateFields` to an array of top-level keys:
 *     res.translateFields = ['title', 'description', 'benefits'];
 *     res.json(schemeDoc);
 *
 *   Only those keys will be translated; the rest pass through.
 */

const { SUPPORTED_CODES, DEFAULT_LANGUAGE } = require('../config/languages');
const { translateJson }                      = require('../utils/jsonTranslator');

/* ── Helpers ────────────────────────────────────────────────────────────────── */

/**
 * Return a validated language code.
 * Rejects unsupported codes silently by falling back to English.
 */
function _resolveLang(raw) {
  const code = (raw || '').toLowerCase().trim();
  return SUPPORTED_CODES.has(code) ? code : DEFAULT_LANGUAGE;
}

/**
 * Selectively translate only specified top-level keys.
 * All other keys are passed through untouched.
 */
async function _translateSelectedFields(data, fields, lang) {
  if (!fields || !fields.length) return await translateJson(data, lang);

  const result = { ...data };
  await Promise.all(
    fields.map(async (field) => {
      if (data[field] !== undefined) {
        result[field] = await translateJson(data[field], lang);
      }
    })
  );
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MIDDLEWARE
═══════════════════════════════════════════════════════════════════════════ */

module.exports = function translationMiddleware(req, res, next) {
  // ── 1. Resolve language ────────────────────────────────────────────────────
  const lang = _resolveLang(req.query.lng);
  req.lng            = lang;
  res.locals.lng     = lang;
  res.locals.isHindi = lang === 'hi';
  res.locals.isEnglish = lang === 'en';

  // Pass through immediately if English (no translation needed)
  if (lang === DEFAULT_LANGUAGE) return next();

  // ── 2. Patch res.json() ───────────────────────────────────────────────────
  const originalJson = res.json.bind(res);
  res.json = async function (data) {
    // Opt-out flag
    if (res.noTranslate) return originalJson(data);

    try {
      const translated = await _translateSelectedFields(
        data,
        res.translateFields,   // undefined → translate everything
        lang
      );
      return originalJson(translated);
    } catch (err) {
      console.error('[TranslationMiddleware] res.json error:', err.message);
      return originalJson(data);   // graceful degradation: send English
    }
  };

  // ── 3. Patch res.render() ─────────────────────────────────────────────────
  const originalRender = res.render.bind(res);
  res.render = async function (view, locals, callback) {
    // Normalise overloads: render(view) / render(view, locals) / render(view, locals, cb)
    if (typeof locals === 'function') {
      callback = locals;
      locals   = {};
    }
    locals = locals || {};

    // Opt-out flag in locals
    if (locals.skipTranslation) return originalRender(view, locals, callback);

    // Merge res.locals (set by middleware) into the per-call locals
    const fullLocals = { ...res.locals, ...locals };

    try {
      // Translate only the data payload keys — skip known EJS helpers,
      // booleans, functions, and the language meta keys we set above.
      const META_KEYS   = new Set(['lng', 'isHindi', 'isEnglish', 'skipTranslation',
                                   'settings', '_locals', 'cache']);
      const toTranslate = {};
      const passThrough = {};

      for (const [key, val] of Object.entries(fullLocals)) {
        if (META_KEYS.has(key) || typeof val === 'function' || typeof val === 'boolean') {
          passThrough[key] = val;
        } else {
          toTranslate[key] = val;
        }
      }

      const fieldsToTranslate = res.translateFields || Object.keys(toTranslate);
      const translated         = await _translateSelectedFields(toTranslate, fieldsToTranslate, lang);
      const mergedLocals       = { ...passThrough, ...translated };

      return originalRender(view, mergedLocals, callback);
    } catch (err) {
      console.error('[TranslationMiddleware] res.render error:', err.message);
      return originalRender(view, fullLocals, callback);   // fallback
    }
  };

  next();
};
