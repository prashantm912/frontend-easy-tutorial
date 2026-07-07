/*
 * Udemy course transcript extractor
 * ---------------------------------
 * Paste into the browser DevTools console while LOGGED IN and viewing ANY
 * lecture of the target course. Downloads every lecture's caption track as a
 * single .txt (timestamps stripped, consecutive duplicate lines removed).
 *
 * Works for personal Udemy (www.udemy.com) AND Udemy Business org subdomains
 * (e.g. company.udemy.com) because it calls the API on `location.origin`.
 *
 * It uses your EXISTING logged-in session via `credentials: 'include'`.
 * It never reads, prints, or transmits your auth token (the access_token
 * cookie is httpOnly and stays with the browser).
 *
 * Only use on courses you legitimately have access to, for personal study.
 */
(async () => {
  // ---- config -------------------------------------------------------------
  let COURSE_ID = 'auto';                     // 'auto' = detect, or hardcode a number
  const LANG = /english|en[_-]?US|\ben\b/i;   // preferred caption language matcher
  const DELAY_MS = 150;                       // politeness delay between caption fetches
  // -------------------------------------------------------------------------

  const O = location.origin;                  // correct host — fixes cross-subdomain 403s
  const H = { Accept: 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' };
  const api = p => fetch(O + '/api-2.0/' + p, { credentials: 'include', headers: H });
  const strip = u => u.replace(/^https?:\/\/[^/]+\/api-2.0\//, '');
  const slug = location.pathname.split('/')[2] || 'course';

  // ---- detect courseId ----------------------------------------------------
  if (COURSE_ID === 'auto') {
    const el = document.querySelector('[data-module-args]');       // course-taking app config
    if (el) { try { COURSE_ID = JSON.parse(el.dataset.moduleArgs).courseId; } catch {} }
    if (COURSE_ID === 'auto')
      COURSE_ID = (document.documentElement.innerHTML.match(/"courseId"\s*:\s*(\d+)/) || [])[1];
    if (!COURSE_ID || COURSE_ID === 'auto')
      return console.error('Could not detect courseId. Set COURSE_ID manually and re-run.');
  }
  console.log('courseId:', COURSE_ID, '| origin:', O);

  // ---- pull the whole curriculum (chapters + lectures, captions inline) ---
  const items = [];
  let url = `courses/${COURSE_ID}/subscriber-curriculum-items/?curriculum_types=chapter,lecture&page_size=200`
    + `&fields[lecture]=id,title,object_index,asset&fields[chapter]=title,object_index`
    + `&fields[asset]=captions,asset_type&fields[caption]=url,source,file_name,locale_id&caching_intent=True`;
  while (url) {
    const r = await api(url).then(r => r.json());
    if (r.detail) return console.error('API said:', r.detail);
    items.push(...(r.results || []));
    url = r.next ? strip(r.next) : null;
  }
  console.log('curriculum items:', items.length);

  // ---- helpers ------------------------------------------------------------
  const vtt2txt = v => {
    const out = [];
    for (let ln of v.split(/\r?\n/)) {
      ln = ln.trim();
      if (!ln || ln === 'WEBVTT' || /^\d+$/.test(ln) || ln.includes('-->')) continue;
      ln = ln.replace(/<[^>]+>/g, '');                 // strip inline <c>/<i> tags
      if (out[out.length - 1] !== ln) out.push(ln);    // drop consecutive dupes (auto-captions)
    }
    return out.join(' ');
  };

  // captions may arrive inline on the asset; if not, fetch the lecture detail
  const getCaps = async it => {
    if (it.asset?.captions?.length) return it.asset.captions;
    try {
      const d = await api(`users/me/subscribed-courses/${COURSE_ID}/lectures/${it.id}/`
        + `?fields[lecture]=asset&fields[asset]=captions&fields[caption]=url,source,file_name,locale_id`)
        .then(r => r.json());
      return d.asset?.captions || [];
    } catch { return []; }
  };

  // ---- build the document + download --------------------------------------
  let doc = `# ${slug} — transcript\n`, n = 0, lec = 0;
  for (const it of items) {
    if (it._class === 'chapter') { doc += `\n\n# ${it.title}\n`; continue; }
    if (it._class !== 'lecture') continue;
    lec++;
    const cs = await getCaps(it);
    const cap = cs.find(c => LANG.test(c.file_name || c.locale_id || '') && c.source !== 'auto')
             || cs.find(c => LANG.test(c.file_name || c.locale_id || ''))
             || cs[0];
    doc += `\n## ${it.title}\n`;
    if (!cap) { doc += '(no captions)\n'; continue; }               // e.g. text-only / ebook lectures
    try { doc += vtt2txt(await fetch(cap.url).then(r => r.text())) + '\n'; n++; }
    catch { doc += '(caption fetch failed)\n'; }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([doc], { type: 'text/plain' }));
  a.download = `${slug}-transcript.txt`;
  a.click();
  console.log(`Done: ${n}/${lec} lectures had captions.`);
})();
