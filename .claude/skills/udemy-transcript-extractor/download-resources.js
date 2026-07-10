/*
 * Udemy course RESOURCE downloader
 * --------------------------------
 * Companion to extract-transcripts.js. Paste into the browser DevTools console
 * while LOGGED IN and viewing ANY lecture of the target course. Downloads every
 * downloadable resource attached to every lecture (File / SourceCode / E-Book),
 * and writes a manifest .txt listing ALL resources including external links.
 *
 * Works for personal Udemy (www.udemy.com) AND Udemy Business org subdomains
 * because it calls the API on `location.origin`.
 *
 * It uses your EXISTING logged-in session via `credentials: 'include'`.
 * It never reads, prints, or transmits your auth token (httpOnly cookie).
 *
 * Only use on courses you legitimately have access to, for personal study.
 *
 * NOTE ON DOWNLOADS:
 *  - The browser will likely show a one-time "Allow this site to download
 *    multiple files?" prompt — click Allow, or downloads after the first stall.
 *  - Signed download URLs EXPIRE after a few minutes. Files download now; the
 *    URLs saved in the manifest are only good for a short while afterward.
 *  - External-link resources (GitHub, articles, etc.) can't be downloaded — they
 *    are listed in the manifest so you can open them yourself.
 */
(async () => {
  // ---- config -------------------------------------------------------------
  let COURSE_ID = 'auto';          // 'auto' = detect, or hardcode a number
  const DELAY_MS = 800;            // pause between file downloads (politeness + avoid throttling)
  const FILES = true;              // set false to only build the manifest, download nothing
  // -------------------------------------------------------------------------

  const O = location.origin;       // correct host — fixes cross-subdomain 403s
  const H = { Accept: 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' };
  const api = p => fetch(O + '/api-2.0/' + p, { credentials: 'include', headers: H });
  const strip = u => u.replace(/^https?:\/\/[^/]+\/api-2.0\//, '');
  const slug = location.pathname.split('/')[2] || 'course';

  // ---- detect courseId ----------------------------------------------------
  if (COURSE_ID === 'auto') {
    const el = document.querySelector('[data-module-args]');
    if (el) { try { COURSE_ID = JSON.parse(el.dataset.moduleArgs).courseId; } catch {} }
    if (COURSE_ID === 'auto')
      COURSE_ID = (document.documentElement.innerHTML.match(/"courseId"\s*:\s*(\d+)/) || [])[1];
    if (!COURSE_ID || COURSE_ID === 'auto')
      return console.error('Could not detect courseId. Set COURSE_ID manually and re-run.');
  }
  console.log('courseId:', COURSE_ID, '| origin:', O);

  // ---- pull the whole curriculum (chapters + lectures, asset stubs inline) -
  const items = [];
  let url = `courses/${COURSE_ID}/subscriber-curriculum-items/?curriculum_types=chapter,lecture&page_size=200`
    + `&fields[lecture]=id,title,object_index,supplementary_assets&fields[chapter]=title,object_index`
    + `&fields[asset]=id,asset_type,title,filename&caching_intent=True`;
  while (url) {
    const r = await api(url).then(r => r.json());
    if (r.detail) return console.error('API said:', r.detail);
    items.push(...(r.results || []));
    url = r.next ? strip(r.next) : null;
  }
  console.log('curriculum items:', items.length);

  // ---- fetch download URLs for a lecture's supplementary assets -----------
  // download_urls / external_url are NOT returned in bulk on the curriculum;
  // grab them per-lecture (only for lectures that actually have assets).
  const getAssets = async id => {
    try {
      const d = await api(`users/me/subscribed-courses/${COURSE_ID}/lectures/${id}/`
        + `?fields[lecture]=supplementary_assets`
        + `&fields[asset]=id,asset_type,title,filename,download_urls,external_url`)
        .then(r => r.json());
      return d.supplementary_assets || [];
    } catch { return []; }
  };

  // pick a direct file URL out of the download_urls map (keyed by asset_type)
  const fileUrl = a => {
    const du = a.download_urls || {};
    const arr = du.File || du.SourceCode || du['E-Book'] || du.Ebook || Object.values(du)[0] || [];
    return (arr[0] && arr[0].file) || null;
  };

  // ---- iterate + download + build manifest --------------------------------
  const dl = document.createElement('a');
  document.body.appendChild(dl);
  let manifest = `# ${slug} — lecture resources\n`;
  let nFiles = 0, nLinks = 0, nUnresolved = 0, nLec = 0;

  for (const it of items) {
    if (it._class === 'chapter') { manifest += `\n\n# ${it.title}\n`; continue; }
    if (it._class !== 'lecture') continue;
    if (!(it.supplementary_assets && it.supplementary_assets.length)) continue;  // skip lectures w/o resources

    nLec++;
    manifest += `\n## ${it.title}\n`;
    const assets = await getAssets(it.id);
    for (const a of assets) {
      const name = a.filename || a.title || String(a.id);
      if (a.external_url) {                                   // link resource — list only
        manifest += `- [link] ${a.title || name} -> ${a.external_url}\n`;
        nLinks++;
        continue;
      }
      const u = fileUrl(a);
      if (!u) {                                               // couldn't resolve a URL
        manifest += `- [??? ] ${name} (${a.asset_type || 'unknown'}) — no download url\n`;
        nUnresolved++;
        continue;
      }
      manifest += `- [file] ${name} -> ${u}\n`;
      nFiles++;
      if (FILES) {
        dl.href = u; dl.download = name;
        dl.click();
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }
  }
  dl.remove();

  // ---- save the manifest --------------------------------------------------
  const m = document.createElement('a');
  m.href = URL.createObjectURL(new Blob([manifest], { type: 'text/plain' }));
  m.download = `${slug}-resources.txt`;
  m.click();

  console.log(`Done: ${nFiles} file(s) ${FILES ? 'downloaded' : 'found'}, `
    + `${nLinks} external link(s) listed, ${nUnresolved} unresolved, `
    + `across ${nLec} lecture(s) with resources. Manifest: ${slug}-resources.txt`);
})();
