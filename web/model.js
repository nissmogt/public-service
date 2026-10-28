export function revenueSeries(revenue) {
  const points = [{ year: revenue.baselineYear, amount: revenue.baseline, baseline: true }, { year: revenue.testYear, amount: revenue.testYearAmount, baseline: false }];
  for (const increment of revenue.increments) {
    points.push({ year: increment.year, amount: points.at(-1).amount + increment.amount, baseline: false });
  }
  return points;
}

export function percentageChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0) throw new RangeError('A positive baseline and finite values are required.');
  return (to / from - 1) * 100;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function filterEvidence(records, { query = '', status = 'all' } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  return records.filter(record => (status === 'all' || record.status === status) && `${record.title} ${record.summary} ${record.category}`.toLocaleLowerCase().includes(needle));
}

export function buildComment({ name = '', city = '', role = 'residential customer', experience = '', demandIds = [], position = 'scrutiny' }, utilityCase) {
  const choices = utilityCase.demands.filter(demand => demandIds.includes(demand.id));
  const clean = value => String(value).trim();
  const identity = clean(name) ? `My name is ${clean(name)}. ` : '';
  const place = clean(city) ? ` in ${clean(city)}` : '';
  const opening = position === 'oppose'
    ? 'I oppose approving the proposed increase as submitted without evidence that the requested spending is necessary and reasonably priced.'
    : 'I ask the Commission to scrutinize this request and approve only spending shown to be necessary, prudent and reasonably priced.';
  const demands = choices.length ? `Before deciding, please:\n${choices.map((demand, i) => `${i + 1}. ${demand.request}`).join('\n')}` : '';
  return [
    `Re: ${utilityCase.docket} — ${utilityCase.utility} General Rate Case`,
    'To the California Public Utilities Commission:',
    `${identity}I am a ${role}${place}. ${opening}`,
    clean(experience),
    `The company’s notice requests approximately $${utilityCase.notice.increaseMillions} million in additional annual revenue for 2028, followed by further increases through 2031. Its illustrative monthly increase does not describe every household’s experience or the full multi-year effect.`,
    demands,
    'Safe and reliable service matters. Please explain the evidence supporting any approved increase and the protections that will prevent customers from paying avoidable costs.',
    'Thank you for considering this comment.'
  ].filter(Boolean).join('\n\n');
}

function icsEscape(value) { return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); }
function icsDate(value) { return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
// Fold at 75 UTF-8 octets, including the continuation space (RFC 5545).
function foldLine(line) {
  const result = []; let current = '';
  for (const char of line) {
    if (new TextEncoder().encode(current + char).length > 75) { result.push(current); current = ' '; }
    current += char;
  }
  result.push(current);
  return result.join('\r\n');
}

export function createCalendar(events, sourceUrl, generatedAt = new Date()) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Public Service//Utility Hearings//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const event of events) {
    lines.push('BEGIN:VEVENT', `UID:${event.id}@public-service.nissmogt.github.io`, `DTSTAMP:${icsDate(generatedAt)}`, `DTSTART:${icsDate(event.start)}`, `DTEND:${icsDate(event.end)}`, `SUMMARY:${icsEscape(event.title)}`, `LOCATION:${icsEscape(event.location)}`, `DESCRIPTION:${icsEscape(`Verify the official schedule: ${sourceUrl}\n${event.endIsEstimate ? 'End time is a planning estimate; no official end time is supplied.\n' : ''}${event.mode === 'By phone' ? 'To speak, call 1-800-857-1917, enter 1673482#, and press *1 when prompted. Webcast-only viewers cannot speak.' : 'Arrive early to sign up if you wish to speak. No RSVP is required.'}`)}`, `URL:${sourceUrl}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

export function upcomingEvents(events, now = new Date()) {
  return events.filter(event => new Date(event.start) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
}

export function isStale(reviewedAt, now = new Date(), maxAgeDays = 14) {
  return now.getTime() - Date.parse(`${reviewedAt}T23:59:59Z`) > maxAgeDays * 86400000;
}
