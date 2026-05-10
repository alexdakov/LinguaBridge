// ─── SANITY.IO HELPER ────────────────────────────────────────────────────────
// LinguaBridge — Plain JS / Vanilla, no framework

const SANITY_PROJECT_ID  = 'gmq806pj';
const SANITY_DATASET     = 'production';
const SANITY_API_VERSION = '2024-01-01';

// Use apicdn for cached public reads (faster, no token needed)
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function sanityFetch(query, params = {}) {
    const url = new URL(SANITY_CDN);
    url.searchParams.set('query', query);
    // Encode each param as JSON (Sanity expects $param="value" or $param=123)
    Object.entries(params).forEach(([k, v]) => {
        url.searchParams.set(`$${k}`, JSON.stringify(v));
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    return json.result;
}

// ─── Image URL builder ────────────────────────────────────────────────────────
// Reconstructs Sanity CDN image URL from an asset reference
// ref format: "image-{assetId}-{WxH}-{ext}"
function urlFor(source, width = 800) {
    if (!source || !source.asset || !source.asset._ref) return '';
    const ref = source.asset._ref;                 // e.g. "image-abc123-1920x1080-jpg"
    const withoutPrefix = ref.slice(6);            // remove "image-"
    const parts = withoutPrefix.split('-');
    const ext     = parts.pop();                   // "jpg"
    const dims    = parts.pop();                   // "1920x1080"
    const assetId = parts.join('-');               // remaining (handles any dashes in ID)
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${assetId}-${dims}.${ext}?w=${width}&fit=max&auto=format`;
}

// ─── Date formatting ──────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ─── HTML escape ─────────────────────────────────────────────────────────────
function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
}

// ─── Portable Text renderer ───────────────────────────────────────────────────
// Converts Sanity Portable Text blocks to HTML string
function renderPortableText(blocks) {
    if (!Array.isArray(blocks) || !blocks.length) {
        return '<p class="text-slate-400 italic">No content.</p>';
    }

    // Render inline spans with marks (bold, italic, links, etc.)
    function renderInline(children, markDefs) {
        return (children || []).map(span => {
            if (span._type !== 'span') return '';
            let t = escHtml(span.text || '');
            // Apply marks in reverse so nesting wraps correctly
            [...(span.marks || [])].reverse().forEach(mark => {
                const def = (markDefs || []).find(d => d._key === mark);
                if (def) {
                    // Custom mark definition (e.g. link)
                    if (def._type === 'link') {
                        const href = escHtml(def.href || '#');
                        const external = /^https?:\/\//.test(def.href || '');
                        t = `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="text-[#FF7582] underline decoration-rose-200 underline-offset-2 hover:text-[#a93444] transition-colors">${t}</a>`;
                    }
                } else {
                    // Built-in marks
                    switch (mark) {
                        case 'strong':
                            t = `<strong class="font-bold text-slate-800">${t}</strong>`; break;
                        case 'em':
                            t = `<em>${t}</em>`; break;
                        case 'code':
                            t = `<code class="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-[0.875em] font-mono">${t}</code>`; break;
                        case 'underline':
                            t = `<u>${t}</u>`; break;
                        case 'strike-through':
                            t = `<s class="text-slate-400">${t}</s>`; break;
                    }
                }
            });
            return t;
        }).join('');
    }

    const html = [];
    let i = 0;

    while (i < blocks.length) {
        const block = blocks[i];

        // ── Image block ──
        if (block._type === 'image') {
            const src = urlFor(block, 900);
            const alt = escHtml(block.alt || '');
            const caption = block.caption
                ? `<figcaption class="text-center text-sm text-slate-400 mt-3 italic">${escHtml(block.caption)}</figcaption>`
                : '';
            html.push(`<figure class="my-8">${src ? `<img src="${src}" alt="${alt}" loading="lazy" class="w-full rounded-2xl shadow-sm">` : ''}${caption}</figure>`);
            i++; continue;
        }

        // ── Non-block types (skip unknown) ──
        if (block._type !== 'block') { i++; continue; }

        // ── List items — group consecutive items of same type ──
        if (block.listItem) {
            const listType  = block.listItem; // 'bullet' | 'number'
            const level     = block.level || 1;
            const tag       = listType === 'number' ? 'ol' : 'ul';
            const cls       = listType === 'number'
                ? 'list-decimal ml-6 space-y-1.5 mb-5 text-slate-600 leading-relaxed'
                : 'list-disc ml-6 space-y-1.5 mb-5 text-slate-600 leading-relaxed';
            const items = [];
            while (i < blocks.length && blocks[i].listItem === listType && (blocks[i].level || 1) === level) {
                items.push(`<li>${renderInline(blocks[i].children, blocks[i].markDefs)}</li>`);
                i++;
            }
            html.push(`<${tag} class="${cls}">${items.join('')}</${tag}>`);
            continue;
        }

        // ── Normal block ──
        const text  = renderInline(block.children, block.markDefs);
        const style = block.style || 'normal';

        switch (style) {
            case 'h1':
                html.push(`<h1 class="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl font-extrabold text-slate-900 mt-12 mb-5 leading-tight">${text}</h1>`);
                break;
            case 'h2':
                html.push(`<h2 class="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-bold text-slate-900 mt-10 mb-4 leading-snug">${text}</h2>`);
                break;
            case 'h3':
                html.push(`<h3 class="font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-800 mt-8 mb-3">${text}</h3>`);
                break;
            case 'h4':
                html.push(`<h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-slate-800 mt-6 mb-2">${text}</h4>`);
                break;
            case 'blockquote':
                html.push(`<blockquote class="border-l-4 border-[#FF7582] pl-6 py-2 my-7 italic text-slate-600 bg-rose-50/50 rounded-r-xl">${text}</blockquote>`);
                break;
            default:
                if (text.trim()) {
                    html.push(`<p class="text-slate-600 leading-[1.85] mb-5">${text}</p>`);
                } else {
                    html.push('<div class="mb-3"></div>');
                }
        }
        i++;
    }

    return html.join('\n');
}

// ─── GROQ queries ─────────────────────────────────────────────────────────────

// All posts for list page (no body — lighter payload)
const QUERY_ALL_POSTS = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  "author": author->{name, image},
  "categories": categories[]->{title}
}`;

// Single post by slug (includes body)
const QUERY_POST_BY_SLUG = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  body,
  "author": author->{name, slug, image, bio},
  "categories": categories[]->{title}
}`;
