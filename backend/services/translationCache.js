/**
 * translationCache.js
 * ─────────────────────────────────────────────────────────────
 * Lightweight in-process LRU cache for translated strings.
 *
 * WHY in-memory and not Redis?
 *   - Avoids DB writes (requirement).
 *   - For a single-server deployment this is zero-latency.
 *   - For multi-server: swap `TranslationCache` with a thin
 *     Redis adapter — the interface stays identical.
 *
 * Eviction policy: Least-Recently-Used (LRU).
 * Node ≥ 18: Map iteration order == insertion order, which lets
 * us implement O(1) LRU with delete + re-insert on access.
 */

class TranslationCache {
  /**
   * @param {number} maxSize      Maximum number of cached entries (default 10 000)
   * @param {number} ttlMs        Time-to-live per entry in ms (default 1 hour)
   */
  constructor(maxSize = 10_000, ttlMs = 60 * 60 * 1_000) {
    this._maxSize = maxSize;
    this._ttlMs   = ttlMs;
    this._store   = new Map();   // key → { value, expiresAt }
  }

  /** Build a deterministic cache key. */
  _key(lang, text) {
    return `${lang}\x00${text}`;          // \x00 cannot appear in lang codes
  }

  /**
   * Retrieve a cached translation.
   * Returns `undefined` on miss or expiry.
   */
  get(lang, text) {
    const key   = this._key(lang, text);
    const entry = this._store.get(key);
    if (!entry) return undefined;

    // Expire check
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }

    // LRU: promote to end (most-recently-used)
    this._store.delete(key);
    this._store.set(key, entry);
    return entry.value;
  }

  /**
   * Store a translation.
   * Evicts the oldest entry when the cache is full.
   */
  set(lang, text, translation) {
    const key = this._key(lang, text);

    // If updating an existing key, delete first to re-insert at end
    if (this._store.has(key)) this._store.delete(key);

    // Evict oldest entry if at capacity
    if (this._store.size >= this._maxSize) {
      const oldestKey = this._store.keys().next().value;
      this._store.delete(oldestKey);
    }

    this._store.set(key, {
      value    : translation,
      expiresAt: Date.now() + this._ttlMs,
    });
  }

  /** Statistics — useful for APM / health endpoints. */
  stats() {
    return {
      size   : this._store.size,
      maxSize: this._maxSize,
      ttlMs  : this._ttlMs,
    };
  }

  /** Flush all entries (use in tests or on config reload). */
  flush() {
    this._store.clear();
  }
}

// Export a singleton — shared across all requests in this process.
module.exports = new TranslationCache();
