// ─── LINGUA BRIDGE — DYNAMIC TRANSLATION LAYER ───────────────────────────────
// Uses Google Translate unofficial endpoint (no API key, no backend required).
// Caches results in sessionStorage so language switches are instant after first load.

const LB_LANG_MAP = {
    en: 'en',
    bg: 'bg',
    ru: 'ru',
    zh: 'zh-CN',
};
const LB_TRANS_CACHE_PREFIX = 'lb_tr_';

// ─── Low-level single call ────────────────────────────────────────────────────
async function _gtCall(text, tl) {
    if (!text || !text.trim()) return text;
    const url =
        `https://translate.googleapis.com/translate_a/single` +
        `?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Translate API ${res.status}`);
    const data = await res.json();
    // data[0] → array of [translatedSegment, originalSegment, ...]
    return data[0].map(seg => seg[0]).join('');
}

// ─── Translate an array of strings (parallel, cached) ─────────────────────────
// Returns array of same length. Falls back gracefully on any individual failure.
async function translateStrings(strings, targetLang, cacheKey) {
    if (!strings.length || targetLang === 'en') return strings;

    const tl  = LB_LANG_MAP[targetLang] || targetLang;
    const key = `${LB_TRANS_CACHE_PREFIX}${targetLang}_${cacheKey}`;

    // ── Cache hit ──
    try {
        const cached = sessionStorage.getItem(key);
        if (cached) return JSON.parse(cached);
    } catch (_) {}

    // ── Parallel translate ──
    const results = await Promise.all(
        strings.map(text =>
            (text && text.trim())
                ? _gtCall(text, tl).catch(() => text)   // fail-safe
                : Promise.resolve(text)
        )
    );

    try { sessionStorage.setItem(key, JSON.stringify(results)); } catch (_) {}
    return results;
}

// ─── Translate Sanity Portable Text blocks ────────────────────────────────────
// Each block (paragraph / heading / list item) is translated as a whole string
// so the translation API gets full sentence context. Block styles (h1-h4,
// blockquote, bullet/number listItem) are preserved. Inline marks (bold, italic,
// links) are dropped in the translated copy — their positions would shift anyway.
// The original EN blocks are NEVER mutated.
async function translatePortableText(blocks, targetLang, cacheKey) {
    if (!Array.isArray(blocks) || !blocks.length || targetLang === 'en') return blocks;

    const tl  = LB_LANG_MAP[targetLang] || targetLang;
    const key = `${LB_TRANS_CACHE_PREFIX}${targetLang}_pt_${cacheKey}`;

    // ── Cache hit ──
    try {
        const cached = sessionStorage.getItem(key);
        if (cached) return JSON.parse(cached);
    } catch (_) {}

    // Build per-block text (null for non-text blocks like images)
    const blockTexts = blocks.map(block => {
        if (block._type === 'block' && Array.isArray(block.children)) {
            const full = block.children.map(s => s.text || '').join('');
            return full.trim() ? full : null;
        }
        return null; // image blocks, etc.
    });

    // Parallel translate (only non-null blocks)
    const promises = blockTexts.map(text =>
        text ? _gtCall(text, tl).catch(() => text) : Promise.resolve(null)
    );
    const translated = await Promise.all(promises);

    // Deep-clone blocks and apply translations
    const out = JSON.parse(JSON.stringify(blocks));
    translated.forEach((result, i) => {
        if (result !== null && out[i]._type === 'block' && Array.isArray(out[i].children)) {
            // Replace children with single plain span — marks don't survive translation
            out[i].children = [{
                _key:  'tr0',
                _type: 'span',
                text:  result,
                marks: [],
            }];
        }
    });

    try { sessionStorage.setItem(key, JSON.stringify(out)); } catch (_) {}
    return out;
}

// ─── Translate a single string ────────────────────────────────────────────────
async function translateOne(text, targetLang, cacheKey) {
    if (!text || targetLang === 'en') return text;
    const results = await translateStrings([text], targetLang, cacheKey || text.slice(0, 30));
    return results[0] || text;
}
