import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { revenueSeries, percentageChange, buildComment, filterEvidence, escapeHtml, createCalendar, upcomingEvents, isStale } from '../web/model.js';
import { validateCampaign } from '../scripts/validate.mjs';

const data = JSON.parse(await readFile(new URL('../web/data/campaign.json', import.meta.url), 'utf8'));
const c = data.cases[0];

test('published dataset reconciles financial components and has source references', () => {
  assert.deepEqual(validateCampaign(data), []);
  const malformed = structuredClone(data);
  malformed.cases[0].composition.items[0].amount += 100;
  malformed.evidence[0].sourceIds = ['nonexistent'];
  malformed.hearings[0].start = '2026-11-09T14:00:00';
  const errors = validateCampaign(malformed);
  assert.ok(errors.some(error => error.includes('reconcile')));
  assert.ok(errors.some(error => error.includes('missing source')));
  assert.ok(errors.some(error => error.includes('timezone')));
});

test('post-test year amounts are increments, not replacement totals or household bill increases', () => {
  const points = revenueSeries(c.revenue);
  assert.deepEqual(points.map(point => point.year), [2027, 2028, 2029, 2030, 2031]);
  assert.ok(Math.abs(points.at(-1).amount - 6037.306) < 0.001);
  assert.equal(percentageChange(points[0].amount, points.at(-1).amount).toFixed(1), '30.9');
  assert.throws(() => percentageChange(0, 100), RangeError);
  assert.equal(c.composition.total, c.revenue.testYearAmount);
  assert.notEqual(c.composition.total, c.notice.increaseMillions);
});

test('comment builder respects position, optional identity, personal experience, and selected requests', () => {
  const draft = buildComment({ name: 'A Customer', city: 'Glendale', role: 'small-business customer', experience: 'Our operating costs are rising.', position: 'oppose', demandIds: ['combined'] }, c);
  assert.match(draft, /A\.26-06-014/);
  assert.match(draft, /A Customer/);
  assert.match(draft, /small-business customer in Glendale/);
  assert.match(draft, /Our operating costs are rising/);
  assert.match(draft, /I oppose approving/);
  assert.match(draft, /combined household impact/);
  assert.doesNotMatch(draft, /Require independent scrutiny of major investments/);
  const neutral = buildComment({}, c);
  assert.doesNotMatch(neutral, /My name is|undefined|null|I oppose/);
  assert.match(neutral, /scrutinize this request/);
});

test('evidence search combines text and status without mutating records', () => {
  const result = filterEvidence(data.evidence, { query: '  increase  ', status: 'Open question' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'increase-bridge');
  assert.equal(filterEvidence(data.evidence, { query: 'no matching phrase' }).length, 0);
  assert.equal(data.evidence.length, 6);
});

test('untrusted text is escaped for HTML rendering', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">&\''), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;');
});

test('calendar exports convert Pacific standard time to UTC and disclose estimated end times', () => {
  const text = createCalendar([data.hearings[0]], 'https://www.cpuc.ca.gov/pph', new Date('2026-10-28T22:00:00Z'));
  const unfolded = text.replace(/\r\n /g, '');
  assert.match(text, /DTSTART:20261109T220000Z/);
  assert.match(text, /DTEND:20261110T000000Z/);
  assert.match(text, /DTSTAMP:20261028T220000Z/);
  assert.match(unfolded, /End time is a planning estimate/);
  assert.match(unfolded, /East\\, Council Chambers/);
  assert.ok(text.endsWith('END:VCALENDAR\r\n'));
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, 'calendar lines should be folded by UTF-8 bytes');
  const remote = createCalendar([data.hearings[2]], 'https://www.cpuc.ca.gov/pph').replace(/\r\n /g, '');
  assert.match(remote, /1673482#/);
  assert.match(remote, /Webcast-only viewers cannot speak/);
});

test('old event schedules do not advertise a past hearing as the next opportunity', () => {
  assert.equal(upcomingEvents(data.hearings, new Date('2026-12-11T00:00:00-08:00')).length, 0);
  assert.equal(upcomingEvents(data.hearings, new Date('2026-11-09T17:00:00-08:00'))[0].id, 'el-monte-evening');
  assert.equal(isStale(data.reviewedAt, new Date('2026-10-28T22:00:00Z')), false);
  assert.equal(isStale(data.reviewedAt, new Date('2026-12-01T22:00:00Z')), true);
});

test('published aggregate data contains no contact list, bill uploads, or individual comment bodies', () => {
  assert.equal(data.organizing.signupUrl, null);
  assert.equal('commenters' in data, false);
  assert.equal('subscribers' in data, false);
  for (const source of data.sources) assert.ok(source.url.startsWith('https://'));
});
