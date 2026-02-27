/**
 * translationService.js
 * ─────────────────────────────────────────────────────────────
 * Provider-agnostic translation layer.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  PROVIDER SELECTION                                     │
 * │                                                         │
 * │  Set TRANSLATION_PROVIDER in .env:                      │
 * │    google   → Google Cloud Translation API v2           │
 * │    azure    → Azure Cognitive Translator                │
 * │    libre    → Self-hosted LibreTranslate                │
 * │    mock     → Echo (for dev/testing without API keys)   │
 * │                                                         │
 * │  Required env vars per provider:                        │
 * │    google: GOOGLE_TRANSLATE_API_KEY                     │
 * │    azure:  AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION│
 * │    libre:  LIBRE_TRANSLATE_URL                          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Performance notes:
 *  • Calls are batched: translateBatch() sends ONE HTTP request
 *    for an array of strings, reducing round-trips dramatically.
 *  • Results are cached in translationCache (in-memory LRU).
 *  • The batch size is capped at BATCH_CHAR_LIMIT characters to
 *    stay within API quota limits.
 */

const axios          = require('axios');
const cache          = require('./translationCache');
const { LANGUAGES, DIALECT_PATCHES } = require('../config/languages');

/* ── Configuration ─────────────────────────────────────────────────────────── */

const PROVIDER        = (process.env.TRANSLATION_PROVIDER || 'google').toLowerCase();
const GOOGLE_API_KEY  = process.env.GOOGLE_TRANSLATE_API_KEY;
const AZURE_KEY       = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_REGION    = process.env.AZURE_TRANSLATOR_REGION || 'centralindia';
const LIBRE_URL       = process.env.LIBRE_TRANSLATE_URL      || 'http://localhost:5000';
const BATCH_CHAR_LIMIT = 4_000;   // chars per API request (Google limit: 5000)

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER IMPLEMENTATIONS
   Each function receives (texts: string[], targetLang: string)
   and returns Promise<string[]> of the same length.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Google Cloud Translation API v2 (Basic)
 * Docs: https://cloud.google.com/translate/docs/reference/rest/v2/translate
 */
async function _googleTranslate(texts, targetLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
  const { data } = await axios.post(url, {
    q     : texts,
    target: targetLang,
    source: 'en',
    format: 'text',
  }, { timeout: 8_000 });

  return data.data.translations.map(t => t.translatedText);
}

/**
 * Microsoft Azure Cognitive Services Translator v3
 * Docs: https://docs.microsoft.com/en-us/azure/cognitive-services/translator/
 */
async function _azureTranslate(texts, targetLang) {
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=${targetLang}`;
  const body = texts.map(t => ({ Text: t }));

  const { data } = await axios.post(url, body, {
    headers: {
      'Ocp-Apim-Subscription-Key'    : AZURE_KEY,
      'Ocp-Apim-Subscription-Region' : AZURE_REGION,
      'Content-Type'                 : 'application/json',
    },
    timeout: 8_000,
  });

  return data.map(r => r.translations[0].text);
}

/**
 * LibreTranslate (self-hosted / libre.translate.api)
 * Docs: https://libretranslate.com/docs
 */
async function _libreTranslate(texts, targetLang) {
  // LibreTranslate does not offer a true batch API — parallelise instead.
  const results = await Promise.all(
    texts.map(text =>
      axios.post(`${LIBRE_URL}/translate`, {
        q      : text,
        source : 'en',
        target : targetLang,
        format : 'text',
      }, { timeout: 8_000 }).then(r => r.data.translatedText)
    )
  );
  return results;
}

/**
 * Mock provider — returns "[lang] original text".
 * Useful during development when no API key is available.
 */
async function _mockTranslate(texts, targetLang) {
  return texts.map(t => `[${targetLang}] ${t}`);
}

/* ── Provider dispatch map ─────────────────────────────────────────────────── */
const PROVIDERS = {
  google: _googleTranslate,
  azure : _azureTranslate,
  libre : _libreTranslate,
  mock  : _mockTranslate,
};

function _getProvider() {
  const fn = PROVIDERS[PROVIDER];
  if (!fn) throw new Error(`Unknown TRANSLATION_PROVIDER: "${PROVIDER}". Choose: google|azure|libre|mock`);

  // Guard: fall back to mock when the required API key is absent so the
  // server doesn't spam 400/401 errors on every request.
  if (PROVIDER === 'google' && !GOOGLE_API_KEY) {
    console.warn('[TranslationService] GOOGLE_TRANSLATE_API_KEY not set — falling back to mock provider. Set TRANSLATION_PROVIDER=mock in .env to silence this warning.');
    return _mockTranslate;
  }
  if (PROVIDER === 'azure' && !AZURE_KEY) {
    console.warn('[TranslationService] AZURE_TRANSLATOR_KEY not set — falling back to mock provider.');
    return _mockTranslate;
  }

  return fn;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIALECT PATCH
   Applies word-substitution on top of Hindi for regional dialects.
═══════════════════════════════════════════════════════════════════════════ */

function _applyDialectPatch(text, dialectCode) {
  const patch = DIALECT_PATCHES[dialectCode];
  if (!patch) return text;

  let result = text;
  for (const [hindiWord, replacement] of Object.entries(patch)) {
    // Global replace using a RegExp for whole-word-ish matching
    result = result.split(hindiWord).join(replacement);
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Translate an array of strings to the given language.
 *
 * Strategy:
 *  1. Pull cache hits immediately.
 *  2. Group cache misses into batches ≤ BATCH_CHAR_LIMIT.
 *  3. Call the provider ONCE per batch.
 *  4. Store results in cache.
 *  5. Apply dialect patch if needed.
 *
 * @param {string[]} texts       Flat array of English strings.
 * @param {string}   langCode    Portal language code (e.g. 'hi', 'bund').
 * @returns {Promise<string[]>}  Same-length array of translated strings.
 */
async function translateBatch(texts, langCode) {
  if (!texts.length) return [];

  const langMeta = LANGUAGES[langCode];
  if (!langMeta) throw new Error(`Unsupported language code: "${langCode}"`);

  const apiCode  = langMeta.apiCode;      // e.g. 'hi' for bund/bag/mal/nim
  const provider = _getProvider();

  // ── Step 1: Separate cache hits from misses ────────────────────────────────
  const results  = new Array(texts.length);
  const missIdx  = [];                    // indices of cache-miss strings
  const missText = [];                    // the actual strings to translate

  for (let i = 0; i < texts.length; i++) {
    const cached = cache.get(apiCode, texts[i]);
    if (cached !== undefined) {
      results[i] = langMeta.isDialect
        ? _applyDialectPatch(cached, langCode)
        : cached;
    } else {
      missIdx.push(i);
      missText.push(texts[i]);
    }
  }

  if (!missIdx.length) return results;

  // ── Step 2: Split misses into char-limited batches ─────────────────────────
  const batches   = [];     // [ [text, ...], ... ]
  const batchMeta = [];     // [ [origIdx, ...], ... ]
  let   curBatch  = [];
  let   curMeta   = [];
  let   curLen    = 0;

  for (let j = 0; j < missText.length; j++) {
    const t = missText[j];
    if (curLen + t.length > BATCH_CHAR_LIMIT && curBatch.length) {
      batches.push(curBatch);
      batchMeta.push(curMeta);
      curBatch = [];
      curMeta  = [];
      curLen   = 0;
    }
    curBatch.push(t);
    curMeta.push(missIdx[j]);
    curLen += t.length;
  }
  if (curBatch.length) {
    batches.push(curBatch);
    batchMeta.push(curMeta);
  }

  // ── Step 3 & 4: Translate each batch, cache and place results ─────────────
  for (let b = 0; b < batches.length; b++) {
    let translated;
    try {
      translated = await provider(batches[b], apiCode);
    } catch (err) {
      // Graceful degradation: return originals if API fails
      console.error(`[TranslationService] Provider error (${PROVIDER}):`, err.message);
      translated = batches[b];
    }

    for (let k = 0; k < translated.length; k++) {
      const origText   = batches[b][k];
      const transText  = translated[k];
      const origIdx    = batchMeta[b][k];

      // Cache by apiCode (so bund/bag/mal/nim all reuse Hindi cache)
      cache.set(apiCode, origText, transText);

      // Apply dialect patch on top of the Hindi result
      results[origIdx] = langMeta.isDialect
        ? _applyDialectPatch(transText, langCode)
        : transText;
    }
  }

  return results;
}

/**
 * Convenience wrapper — translate a single string.
 *
 * @param {string} text
 * @param {string} langCode
 * @returns {Promise<string>}
 */
async function translateOne(text, langCode) {
  const [result] = await translateBatch([text], langCode);
  return result;
}

module.exports = { translateBatch, translateOne };
