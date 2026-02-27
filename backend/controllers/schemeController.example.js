/**
 * schemeController.example.js
 * ─────────────────────────────────────────────────────────────
 * Example controller showing how to use the translation system.
 *
 * NOTE: This is a reference file. The actual controller is
 * schemeController.js — copy the patterns shown here as needed.
 *
 * Key points:
 *  • Controllers stay 100% English. No translation logic here.
 *  • The middleware handles everything transparently.
 *  • Use res.translateFields to limit cost by translating only
 *    the visible, human-readable fields.
 *  • Use res.noTranslate = true for internal/admin endpoints.
 */

const Scheme = require('../models/Scheme');   // adjust path as needed
const { translateJson } = require('../utils/jsonTranslator');

/* ── Example 1: JSON API — full automatic translation ─────────────────────── */

/**
 * GET /api/schemes/:id?lng=hi
 *
 * The middleware patches res.json() automatically.
 * You write the controller exactly as you would for English.
 */
exports.getSchemeById_API = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();
    if (!scheme) return res.status(404).json({ message: 'Scheme not found.' });

    // Middleware translates this before it reaches the client.
    res.json({ success: true, data: scheme });
  } catch (err) {
    next(err);
  }
};

/* ── Example 2: JSON API — translate only selected fields ─────────────────── */

/**
 * GET /api/schemes?lng=ta
 *
 * For large documents, limit translation to the fields users actually
 * read — this cuts API cost and latency significantly.
 */
exports.listSchemes_API = async (req, res, next) => {
  try {
    const schemes = await Scheme.find({ isActive: true }).lean();

    // Only translate these human-readable fields; leave _id, codes, etc.
    res.translateFields = ['title', 'description', 'benefits', 'eligibility', 'documents'];

    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (err) {
    next(err);
  }
};

/* ── Example 3: EJS (SSR) — full automatic translation ───────────────────── */

/**
 * GET /schemes/:id?lng=mr
 *
 * res.render() is patched by the middleware. Pass data as usual.
 */
exports.getSchemeById_EJS = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();
    if (!scheme) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found' });
    }

    // Middleware translates `scheme` and `pageTitle` before EJS compiles.
    res.render('schemes/detail', {
      pageTitle : scheme.title,
      scheme,
      breadcrumb: ['Home', 'Schemes', scheme.title],
    });
  } catch (err) {
    next(err);
  }
};

/* ── Example 4: EJS — translate only selected locals ─────────────────────── */

/**
 * GET /schemes?lng=kn
 */
exports.listSchemes_EJS = async (req, res, next) => {
  try {
    const schemes = await Scheme.find({ isActive: true }).lean();

    // Only translate the human-readable locals; skip 'pagination' (numbers/codes).
    res.translateFields = ['pageTitle', 'schemes', 'breadcrumb'];

    res.render('schemes/list', {
      pageTitle : 'Government Schemes',
      schemes,
      breadcrumb: ['Home', 'Schemes'],
      pagination: { page: 1, total: schemes.length },   // not translated
    });
  } catch (err) {
    next(err);
  }
};

/* ── Example 5: Opt-out — admin / internal endpoint ──────────────────────── */

/**
 * GET /admin/schemes/:id  (no translation ever)
 */
exports.getSchemeAdmin = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();

    // Disable translation for this response entirely.
    res.noTranslate = true;
    res.json({ success: true, data: scheme });
  } catch (err) {
    next(err);
  }
};

/* ── Example 6: Manual translation (outside middleware) ───────────────────── */

/**
 * Translate a specific field on demand — e.g. for a search snippet.
 */
exports.searchSchemes = async (req, res, next) => {
  try {
    const { q, lng = 'en' } = req.query;
    const results = await Scheme.find({ $text: { $search: q } }).lean();

    if (lng === 'en') {
      return res.json({ success: true, data: results });
    }

    // Manually translate only the summary snippet, not the full document.
    const translated = await Promise.all(
      results.map(async (s) => {
        const { translateJson } = require('../utils/jsonTranslator');
        const snippet = await translateJson(
          { title: s.title, description: s.description },
          lng
        );
        return { ...s, ...snippet };
      })
    );

    res.noTranslate = true;   // already translated above
    res.json({ success: true, data: translated });
  } catch (err) {
    next(err);
  }
};
