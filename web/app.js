import { revenueSeries, percentageChange, escapeHtml as h, filterEvidence, buildComment, createCalendar, upcomingEvents, isStale } from './model.js';

let data;
let utilityCase;
let sourceMap;
const money = amount => amount >= 1000 ? `$${(amount / 1000).toFixed(2)}bn` : `$${amount.toFixed(amount < 100 ? 1 : 0)}m`;
const displayDate = date => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const eventDate = date => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date(date));
const eventTime = date => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).format(new Date(date));
const external = (url, text, cls = '') => `<a class="${cls}" href="${h(url)}" target="_blank" rel="noopener noreferrer">${text} <span aria-hidden="true">↗</span></a>`;
const sourceButton = (ids, label = 'Source notes') => `<button type="button" class="source-button" data-sources="${h(ids.join(','))}">${h(label)} <span aria-hidden="true">↗</span></button>`;

function render() {
  const c = utilityCase;
  const series = revenueSeries(c.revenue);
  const growth = percentageChange(series[0].amount, series.at(-1).amount);
  const upcoming = upcomingEvents(data.hearings);
  const next = upcoming[0];
  const max = series.at(-1).amount;
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <div class="edition-line"><span><span class="live-dot" aria-hidden="true"></span> SOUTHERN CALIFORNIA / UTILITY WATCH</span><span>Record reviewed ${h(displayDate(data.reviewedAt))}</span></div>
      <div id="stale-warning" class="stale-warning" ${isStale(data.reviewedAt) ? '' : 'hidden'}>This record is more than 14 days old. Figures and hearing details may have changed. Check the linked official sources.</div>
      <section class="hero" aria-labelledby="hero-title">
        <div><p class="eyebrow">Your bill is a public issue.</p><h1 id="hero-title">Follow the money.<br><span>Have a say.</span></h1><p class="hero-copy">Utility decisions shape what we all pay. Understand the proposal, examine the evidence, and turn concern into informed action.</p><div class="button-row"><a class="button primary" href="#action">Make your voice count <span aria-hidden="true">↗</span></a><a class="button quiet" href="#money">Explore the numbers <span aria-hidden="true">↓</span></a></div></div>
        <aside class="case-cover" aria-label="Current case"><div class="cover-top"><span>ON THE PUBLIC RECORD</span><span>01 / GAS</span></div><div class="case-emblem" aria-hidden="true"><svg viewBox="0 0 160 100"><path d="M10 85H150M30 85V54H53V85M68 85V35H91V85M106 85V15H129V85"/><path class="emblem-line" d="M16 42 60 16 96 22 139 0"/></svg></div><p class="cover-utility">${h(c.utility)}</p><h2>2028–2031<br>General Rate Case</h2><div class="cover-bottom"><span>${h(c.docket)}</span><span class="status-pill">Proposal pending</span></div></aside>
      </section>
      <section class="metrics" aria-label="Proposal at a glance">
        <article><p class="metric-label">ADDITIONAL ANNUAL REVENUE</p><p class="metric-value">$${h(c.notice.increaseMillions)}<span>m</span></p><p>Requested for ${c.revenue.testYear} · +${h(c.notice.increasePercent)}%</p>${sourceButton(c.notice.sourceIds, 'Utility notice')}</article>
        <article><p class="metric-label">ILLUSTRATIVE MONTHLY INCREASE</p><p class="metric-value">$${c.notice.monthlyIllustration.toFixed(2)}</p><p>${c.notice.illustrationTherms} therms / month · ${c.revenue.testYear} only</p>${sourceButton(c.notice.sourceIds, 'Usage assumptions')}</article>
        <article><p class="metric-label">ANNUAL REVENUE BY 2031</p><p class="metric-value">+${growth.toFixed(1)}<span>%</span></p><p>Compared with expected 2027</p>${sourceButton(c.revenue.sourceIds, 'Calculation & sources')}</article>
        <article><p class="metric-label">PUBLIC COMMENT ENTRIES</p><p class="metric-value">${c.comments.count}</p><p>SoCalGas · snapshot, not a poll</p>${sourceButton(c.comments.sourceIds, `Observed ${displayDate(c.comments.observedAt)}`)}</article>
      </section>
      <p class="under-metrics">Revenue increases and household bill increases are different measures. All figures describe a proposal, not an approved outcome.</p>

      <section id="overview" class="section" aria-labelledby="overview-title">
        <div class="section-heading"><div><p class="eyebrow">01 / THE CASE</p><h2 id="overview-title">Look beyond the first year.</h2></div><p>The proposal would raise the amount collected each year. Here is the full requested trajectory.</p></div>
        <div class="overview-grid">
          <article class="panel revenue-panel"><div class="panel-heading"><h3>Requested annual revenue</h3><span class="small-label">USD BILLIONS</span></div>
            <div class="chart-legend"><span><i class="legend-square baseline"></i>Expected baseline</span><span><i class="legend-square proposed"></i>Proposed</span></div>
            <div class="revenue-chart" role="img" aria-label="Annual revenue: ${series.map(point => `${point.year}, ${(point.amount / 1000).toFixed(2)} billion dollars`).join('; ')}">
              ${series.map(point => `<div class="chart-column" style="--bar-height:${(point.amount / max * 100).toFixed(3)}%"><span class="bar-value">$${(point.amount / 1000).toFixed(2)}</span><div class="bar ${point.baseline ? 'baseline' : 'proposed'}"></div><span class="bar-year">${point.year}</span></div>`).join('')}
            </div><p class="chart-note">${h(c.revenue.note)}</p><details class="chart-data"><summary>View chart data & calculation</summary><table><caption>Annual revenue levels, USD millions</caption><thead><tr><th>Year</th><th>Amount</th><th>Basis</th></tr></thead><tbody>${series.map(point => `<tr><th scope="row">${point.year}</th><td>${point.amount.toFixed(3)}</td><td>${point.baseline ? 'Expected baseline' : 'Requested'}</td></tr>`).join('')}</tbody></table><p>(${series.at(-1).amount.toFixed(3)} ÷ ${series[0].amount.toFixed(3)} − 1) × 100 = ${growth.toFixed(2)}%. Later-year increments are rounded.</p></details>${sourceButton(c.revenue.sourceIds)}</article>
          <aside class="next-hearing"><p class="eyebrow">${next ? 'NEXT OPPORTUNITY TO SPEAK' : 'HEARING RECORD'}</p><h3>${next ? h(eventDate(next.start)) : 'Check the docket'}<span>${next ? `${h(eventTime(next.start))} Pacific` : 'for current opportunities'}</span></h3><div class="hearing-line"></div><p class="hearing-title">${next ? h(next.mode) : 'Scheduled hearings have passed'}</p><p>${next ? h(next.location) : 'The original schedule remains available below for reference.'}</p><a class="button light" href="#hearings">${next ? 'Find your hearing' : 'View the schedule'} <span aria-hidden="true">↗</span></a><p class="small">Public hearings take comments. They do not decide the case that day.</p></aside>
        </div>
        <div class="related-note"><span class="related-icon" aria-hidden="true">↳</span><div><strong>A related case, a separate comment list.</strong><p>SDG&E’s ${h(c.related.docket)} showed ${c.related.comments} entries on ${h(displayDate(c.related.observedAt))}. The cases were consolidated July 7, 2026. These counts are entries, not unique people.</p></div>${external(c.related.url, 'View SDG&E comments', 'inline-link')}</div>
      </section>

      <section id="money" class="section" aria-labelledby="money-title"><div class="section-heading"><div><p class="eyebrow">02 / THE MONEY</p><h2 id="money-title">What is inside the $${(c.composition.total / 1000).toFixed(2)} billion?</h2></div><p>The whole ${c.composition.year} revenue request, broken into the components in the utility’s testimony.</p></div>
        <div class="money-grid"><div><div class="composition-bar" aria-hidden="true">${c.composition.items.map(item => `<span style="width:${item.amount / c.composition.total * 100}%;background:${item.color}"></span>`).join('')}</div><table class="money-table"><caption class="sr-only">2028 proposed revenue composition, USD millions</caption><thead><tr><th>Component</th><th>Amount</th><th>Share</th></tr></thead><tbody>${c.composition.items.map(item => `<tr><th scope="row"><span class="color-dot" style="background:${item.color}"></span>${h(item.label)}</th><td>${money(item.amount)}</td><td>${(item.amount / c.composition.total * 100).toFixed(1)}%</td></tr>`).join('')}<tr class="total-row"><th scope="row">Total requested</th><td>${money(c.composition.total)}</td><td>100%</td></tr></tbody></table>${sourceButton(c.composition.sourceIds, 'Read Table RH-1')}</div><aside class="interpretation"><span class="note-number">!</span><h3>Read the numbers carefully.</h3><p>${h(c.composition.note)}</p><p>Amounts rounded for display. A documented request verifies what was asked for; it does not establish that the spending is justified.</p><a href="#evidence" class="inline-link">See what is still unresolved ↓</a></aside></div>
      </section>

      <section id="evidence" class="section" aria-labelledby="evidence-title"><div class="section-heading"><div><p class="eyebrow">03 / THE EVIDENCE</p><h2 id="evidence-title">Every claim needs a paper trail.</h2></div><a class="inline-link" href="#sources">Browse all sources ↗</a></div>
        <div class="evidence-controls"><div class="search-field"><span aria-hidden="true">⌕</span><label for="evidence-search" class="sr-only">Search the evidence</label><input id="evidence-search" type="search" placeholder="Search claims, costs, questions…" autocomplete="off"></div><div class="filter-buttons" role="group" aria-label="Evidence status"><button type="button" data-filter="all" aria-pressed="true">All</button><button type="button" data-filter="Documented request" aria-pressed="false">Documented requests</button><button type="button" data-filter="Open question" aria-pressed="false">Open questions</button></div></div>
        <p id="evidence-result-count" class="small" aria-live="polite"></p><div id="evidence-results" class="evidence-grid"></div>
      </section>

      <section id="accountability" class="section" aria-labelledby="accountability-title"><div class="section-heading"><div><p class="eyebrow">04 / ACCOUNTABILITY</p><h2 id="accountability-title">Three demands. A public record.</h2></div><p>This is our research tracker. “Not logged” means this project has not recorded a response; it does not mean none exists.</p></div>
        <div class="table-scroll" tabindex="0" role="region" aria-label="Accountability tracker, scroll horizontally on small screens"><table class="accountability-table"><caption class="sr-only">Community demands, research and recorded responses</caption><thead><tr><th>Shared demand</th><th>Research status</th><th>Utility response</th><th>CPUC action</th></tr></thead><tbody>${data.accountability.map((row, i) => `<tr><th scope="row"><span class="demand-index">0${i + 1}</span>${h(c.demands.find(d => d.id === row.demandId).title)}</th><td><span class="tag open">${h(row.status)}</span><p>${h(row.evidence)}</p>${row.sourceIds.length ? sourceButton(row.sourceIds) : ''}</td><td>${h(row.utilityResponse)}</td><td>${h(row.commissionAction)}</td></tr>`).join('')}</tbody></table></div>
      </section>

      <section id="action" class="section" aria-labelledby="action-title"><div class="section-heading"><div><p class="eyebrow">05 / TAKE PART</p><h2 id="action-title">Your experience. Your words.</h2></div><p>Prepare a comment here, edit it, then submit it on the official CPUC page. You stay in control.</p></div>
        <div class="comment-grid"><form id="comment-form" class="panel comment-form"><h3>Build your public comment</h3><p class="small">A structured writing aid. Nothing is submitted automatically.</p><div class="field-row"><label>Your name <span>(optional)</span><input name="name" maxlength="100" autocomplete="name" placeholder="Your name"></label><label>City <span>(optional)</span><input name="city" maxlength="100" autocomplete="address-level2" placeholder="e.g. Glendale"></label></div><label>I’m participating as a<select name="role"><option value="residential customer">Residential customer</option><option value="small-business customer">Small-business customer</option><option value="concerned community member">Concerned community member</option></select></label><label>My position<select name="position"><option value="scrutiny">Require evidence and independent scrutiny</option><option value="oppose">Oppose the increase as submitted</option></select></label><label>How would this affect you? <span>(optional)</span><textarea name="experience" rows="4" maxlength="2500" placeholder="Describe your experience. Avoid account numbers, addresses, or anything you would not want in a public comment."></textarea></label><fieldset><legend>Include these requests</legend>${c.demands.map(d => `<label class="checkbox-label"><input type="checkbox" name="demands" value="${h(d.id)}" checked><span>${h(d.title)}</span></label>`).join('')}</fieldset><button class="button primary full-width" type="submit">Prepare my draft <span aria-hidden="true">→</span></button><p class="privacy-note">Your draft stays in this tab. It is not saved to a server or this project’s repository.</p></form>
          <div class="draft-panel"><div class="panel-heading"><h3>Review & make it yours</h3><span class="small-label">${h(c.docket)}</span></div><label class="sr-only" for="comment-draft">Editable public comment draft</label><textarea id="comment-draft" rows="19" spellcheck="true"></textarea><div class="draft-tools"><button class="button secondary" type="button" id="copy-comment">Copy draft</button><button class="text-button" type="button" id="download-comment">Download .txt ↓</button><span id="word-count" class="small" aria-live="polite"></span></div>${external(c.commentUrl, 'Open CPUC & submit your comment', 'button primary full-width')}<p class="small">Choose “Public Comments,” then “Add Public Comment” if needed. The CPUC publishes comments. Review your wording and personal details before submitting.</p></div></div>
        <div class="participation-note"><strong>Participation is more than a comment count.</strong><p>Public comments can inform the decision, but do not substitute for formal evidence. Connect research with experienced advocates who can challenge spending in the proceeding.</p>${sourceButton(['participation'], 'How the process works')}</div>
      </section>

      <section id="hearings" class="section" aria-labelledby="hearings-title"><div class="section-heading"><div><p class="eyebrow">06 / SHOW UP</p><h2 id="hearings-title">Put a hearing on your calendar.</h2></div><button class="button secondary" type="button" id="download-all-hearings" ${upcoming.length ? '' : 'disabled'}>Add upcoming hearings ↓</button></div><p class="section-intro">All times are Pacific. Calendar end times are two-hour planning estimates, not official end times. Confirm details with the ${external(sourceMap.get('cpuc-hearings').url, 'CPUC schedule')}.</p><div class="hearings-grid">${data.hearings.map(event => `<article class="hearing-card ${new Date(event.start) < new Date() ? 'past-event' : ''}"><div class="event-date"><span>${eventDate(event.start).split(' ')[0]}</span><strong>${eventDate(event.start).split(' ')[1]}</strong></div><div><span class="tag ${event.mode === 'By phone' ? '' : 'open'}">${h(event.mode)}${new Date(event.start) < new Date() ? ' · Past' : ''}</span><h3>${h(eventTime(event.start))} <span>Pacific</span></h3><p>${h(event.location)}</p><button type="button" class="text-button" data-calendar="${h(event.id)}">Download calendar event ↓</button></div></article>`).join('')}</div><p class="under-metrics">To speak remotely: call 1-800-857-1917, enter 1673482#, then press *1 when prompted. Watching the webcast alone does not let you speak.</p></section>

      <section id="organize" class="organize-panel" aria-labelledby="organize-title"><div><p class="eyebrow">DON’T DO IT ALONE</p><h2 id="organize-title">Find the people.<br>Build the case.</h2><p>Connect with existing organizers, follow the official record, or help review a source. Shared concern becomes useful when there is a next step.</p><button type="button" class="button light" id="share-campaign">Share this project ↗</button></div><div class="organize-links">${external(data.organizing.partnerUrl, '<strong>Join an existing effort</strong><span>Explore TURN’s Sempra campaign</span>')}${external(data.organizing.updatesUrl, '<strong>Follow the official proceeding</strong><span>Subscribe to CPUC updates for A.26-06-014</span>')}${external(`${data.repository}/issues/new/choose`, '<strong>Help check the record</strong><span>Contribute a source or report a correction on GitHub</span>')}<div id="signup-slot"></div></div></section>

      <section id="sources" class="section sources-section" aria-labelledby="sources-title"><div class="section-heading"><div><p class="eyebrow">THE OPEN NOTEBOOK</p><h2 id="sources-title">Check our work.</h2></div><button class="text-button" type="button" id="download-data">Download source data .json ↓</button></div><p class="section-intro">${h(data.reviewMethod)} Figures are manually maintained. No live comment feed or automated sentiment score is implied.</p><div class="source-list">${data.sources.map((source, i) => `<article><span class="source-index">${String(i + 1).padStart(2, '0')}</span><div><h3>${external(source.url, h(source.title))}</h3><p>${h(source.publisher)} · ${h(source.locator)}</p></div><span class="source-kind">${h(source.kind)}</span></article>`).join('')}</div></section>
    </div>`;
  renderEvidence();
  prepareDraft();
  const signupSlot = document.querySelector('#signup-slot');
  if (data.organizing.signupUrl) {
    signupSlot.innerHTML = external(data.organizing.signupUrl, '<strong>Join project updates</strong><span>Open the organizer’s opt-in form</span>');
  }
}

let selectedFilter = 'all';
function renderEvidence() {
  const query = document.querySelector('#evidence-search')?.value || '';
  const results = filterEvidence(data.evidence, { query, status: selectedFilter });
  document.querySelector('#evidence-result-count').textContent = `${results.length} of ${data.evidence.length} records shown`;
  document.querySelector('#evidence-results').innerHTML = results.length ? results.map(record => `<article class="evidence-card"><div class="evidence-card-top"><span class="tag ${record.status === 'Open question' ? 'open' : ''}">${h(record.status)}</span><span>${h(record.category)}</span></div><h3>${h(record.title)}</h3><p>${h(record.summary)}</p><div class="evidence-card-bottom">${sourceButton(record.sourceIds, 'Inspect source')}<span>Reviewed ${h(displayDate(record.reviewedAt))}</span></div></article>`).join('') : '<div class="empty-state"><h3>No matching records.</h3><p>Try a different search or select “All.”</p><button type="button" class="button secondary" id="reset-evidence">Reset search</button></div>';
}

function prepareDraft() {
  const form = new FormData(document.querySelector('#comment-form'));
  document.querySelector('#comment-draft').value = buildComment({ name: form.get('name'), city: form.get('city'), role: form.get('role'), position: form.get('position'), experience: form.get('experience'), demandIds: form.getAll('demands') }, utilityCase);
  updateWordCount();
}
function updateWordCount() {
  const words = document.querySelector('#comment-draft').value.trim().split(/\s+/).filter(Boolean).length;
  document.querySelector('#word-count').textContent = `${words} words`;
}
let toastTimeout;
function notify(message) {
  const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('visible'), 5000);
}
function download(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  notify(`Downloaded ${filename}`);
}
async function copyText(value) {
  try { await navigator.clipboard.writeText(value); return true; } catch { return false; }
}
function openSources(ids) {
  const dialog = document.querySelector('#source-dialog');
  document.querySelector('#dialog-title').textContent = 'Follow the source';
  document.querySelector('#dialog-content').innerHTML = ids.map(id => sourceMap.get(id)).filter(Boolean).map(source => `<article class="dialog-source"><span class="tag">${h(source.kind)}</span><h3>${external(source.url, h(source.title))}</h3><p>${h(source.supports)}</p><dl><dt>Where to look</dt><dd>${h(source.locator)}</dd><dt>Reviewed</dt><dd>${h(displayDate(source.reviewedAt))}</dd></dl></article>`).join('') + '<p class="small">Verification means a source supports the stated claim. It does not independently establish that proposed spending is necessary or cost-effective.</p>';
  dialog.showModal();
}

function bindEvents() {
  document.querySelector('#evidence-search').addEventListener('input', renderEvidence);
  document.querySelector('#comment-form').addEventListener('submit', event => { event.preventDefault(); prepareDraft(); notify('Draft prepared. Review and edit before submitting.'); });
  document.querySelector('#comment-draft').addEventListener('input', updateWordCount);
  document.querySelector('#copy-comment').addEventListener('click', async () => {
    const draft = document.querySelector('#comment-draft');
    if (await copyText(draft.value)) notify('Draft copied. Review it before posting to the CPUC.');
    else { draft.focus(); draft.select(); notify('Select Copy on your device, or download the draft.'); }
  });
  document.querySelector('#download-comment').addEventListener('click', () => download(document.querySelector('#comment-draft').value, 'socalgas-public-comment.txt', 'text/plain;charset=utf-8'));
  document.querySelector('#download-data').addEventListener('click', () => download(JSON.stringify(data, null, 2), 'public-service-source-data.json', 'application/json'));
  document.querySelector('#download-all-hearings').addEventListener('click', () => download(createCalendar(upcomingEvents(data.hearings), sourceMap.get('cpuc-hearings').url), 'utility-hearings.ics', 'text/calendar;charset=utf-8'));
  document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#source-dialog').close());
  document.querySelector('#source-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  document.querySelector('#privacy-button').addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = 'Privacy & methodology';
    document.querySelector('#dialog-content').innerHTML = `<p>This version has no advertising, analytics, cookies, account system or contact database. Comment drafts exist in this tab’s memory until you download or submit them elsewhere. Hosting providers may retain ordinary access logs.</p><p>We publish aggregate docket counts, not commenter names or personal profiles. Counts are manually observed entries, not verified unique participants or survey results.</p><p>Sources, calculations and review dates are included in the public dataset. “Open question” identifies unfinished research; it is not an accusation. AI-assisted research must be checked against original documents before publication.</p><p>External services, including the CPUC, TURN and GitHub, have their own privacy policies. CPUC comments and GitHub issues are public. Do not include account numbers or private bills.</p><p>${external(`${data.repository}/blob/main/docs/METHODOLOGY.md`, 'Read the research standards')}<br>${external(`${data.repository}/blob/main/docs/PRIVACY.md`, 'Read the privacy policy')}</p>`;
    document.querySelector('#source-dialog').showModal();
  });
  document.querySelector('#share-campaign').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}`;
    if (navigator.share) { try { await navigator.share({ title: 'Public Service — Utility Watch', text: 'Check the sources behind the proposed SoCalGas increase and find a way to participate.', url }); return; } catch (error) { if (error.name === 'AbortError') return; } }
    if (await copyText(url)) notify('Project link copied.'); else notify(`Share this page using your browser’s Share menu.`);
  });
  document.addEventListener('click', event => {
    const source = event.target.closest('[data-sources]');
    if (source) openSources(source.dataset.sources.split(','));
    const filter = event.target.closest('[data-filter]');
    if (filter) { selectedFilter = filter.dataset.filter; document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter))); renderEvidence(); }
    const calendar = event.target.closest('[data-calendar]');
    if (calendar) { const hearing = data.hearings.find(item => item.id === calendar.dataset.calendar); download(createCalendar([hearing], sourceMap.get('cpuc-hearings').url), `${hearing.id}.ics`, 'text/calendar;charset=utf-8'); }
    if (event.target.closest('#reset-evidence')) { selectedFilter = 'all'; document.querySelector('#evidence-search').value = ''; document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'))); renderEvidence(); }
  });
  const links = [...document.querySelectorAll('nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) { if (entry.isIntersecting) links.forEach(link => { const active = link.hash === `#${entry.target.id}`; if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('#overview, #money, #evidence, #action').forEach(section => observer.observe(section));
  }
}

async function init() {
  try {
    const response = await fetch(new URL('./data/campaign.json', import.meta.url));
    if (!response.ok) throw new Error(`Data request returned ${response.status}`);
    data = await response.json(); utilityCase = data.cases[0]; sourceMap = new Map(data.sources.map(source => [source.id, source]));
    render(); bindEvents();
    // Hash links still work on a fresh load, after the async record has rendered.
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target) target.scrollIntoView();
  } catch (error) {
    console.error('Could not open the public record:', error);
    document.querySelector('#app').innerHTML = '<div class="container panel error-state" role="alert"><h1>The record could not load.</h1><p>Please reload this page. You can still <a href="https://apps.cpuc.ca.gov/c/A2606014">open the official SoCalGas docket</a> or <a href="https://www.cpuc.ca.gov/pph">check hearings at the CPUC</a>.</p></div>';
  }
}
init();
