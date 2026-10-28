import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export function validateCampaign(data) {
  const errors = [];
  const assert = (condition, message) => { if (!condition) errors.push(message); };
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
  const https = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  const finitePositive = value => Number.isFinite(value) && value > 0;
  assert(data.schemaVersion === 1, 'Unsupported schemaVersion');
  assert(date(data.reviewedAt), 'reviewedAt must be an ISO date');
  assert(https(data.repository), 'repository must be HTTPS');
  for (const key of ['sources', 'cases', 'hearings', 'evidence', 'accountability']) assert(Array.isArray(data[key]), `${key} must be an array`);
  if (errors.length) return errors;
  const unique = (items, label) => assert(new Set(items.map(item => item.id)).size === items.length, `${label} IDs must be unique`);
  unique(data.sources, 'Source'); unique(data.cases, 'Case'); unique(data.hearings, 'Hearing'); unique(data.evidence, 'Evidence');
  const sources = new Set(data.sources.map(source => source.id));
  const cases = new Set(data.cases.map(item => item.id));
  const sourceRefs = (item, label, required = true) => {
    assert(Array.isArray(item.sourceIds), `${label} sourceIds must be an array`);
    if (!Array.isArray(item.sourceIds)) return;
    assert(!required || item.sourceIds.length > 0, `${label} requires a source`);
    item.sourceIds.forEach(id => assert(sources.has(id), `${label} references missing source ${id}`));
  };
  for (const source of data.sources) {
    assert(https(source.url), `Source ${source.id} requires an HTTPS URL`);
    assert(date(source.reviewedAt), `Source ${source.id} requires a review date`);
    for (const key of ['title', 'publisher', 'kind', 'locator', 'supports']) assert(typeof source[key] === 'string' && source[key].length > 0, `Source ${source.id} requires ${key}`);
  }
  for (const c of data.cases) {
    assert(/^A\.\d{2}-\d{2}-\d{3}$/.test(c.docket), `Case ${c.id} docket format is invalid`);
    assert(c.status === 'Proposed', `Case ${c.id}: update the UI before publishing a non-proposed case`);
    assert(https(c.commentUrl), `Case ${c.id} commentUrl must be HTTPS`);
    sourceRefs(c.notice, `${c.id} notice`); sourceRefs(c.revenue, `${c.id} revenue`); sourceRefs(c.comments, `${c.id} comments`); sourceRefs(c.composition, `${c.id} composition`); sourceRefs(c.related, `${c.id} related case`);
    assert(finitePositive(c.notice.increaseMillions) && finitePositive(c.notice.increasePercent), `Case ${c.id} increase must be positive`);
    assert(finitePositive(c.notice.monthlyIllustration) && finitePositive(c.notice.illustrationTherms), `Case ${c.id} illustration requires amount and usage`);
    assert(Number.isInteger(c.comments.count) && c.comments.count >= 0 && date(c.comments.observedAt), `Case ${c.id} comment snapshot requires count and date`);
    assert(finitePositive(c.revenue.baseline) && finitePositive(c.revenue.testYearAmount), `Case ${c.id} revenue must be positive`);
    assert(c.revenue.testYear === c.revenue.baselineYear + 1, `Case ${c.id} revenue baseline must precede test year`);
    let lastYear = c.revenue.testYear;
    for (const increment of c.revenue.increments) {
      assert(increment.year === lastYear + 1 && finitePositive(increment.amount), `Case ${c.id} increments must be consecutive and positive`);
      lastYear = increment.year;
    }
    assert(c.composition.items.every(item => finitePositive(item.amount) && /^#[a-f0-9]{6}$/i.test(item.color)), `Case ${c.id} composition values/colors invalid`);
    assert(Math.abs(c.composition.items.reduce((sum, item) => sum + item.amount, 0) - c.composition.total) < 0.002, `Case ${c.id} components must reconcile to total`);
    assert(Math.abs(c.composition.total - c.revenue.testYearAmount) < 0.002, `Case ${c.id} composition and requested revenue must agree`);
    unique(c.demands, 'Demand');
  }
  for (const event of data.hearings) {
    sourceRefs(event, `Hearing ${event.id}`);
    assert(cases.has(event.caseId), `Hearing ${event.id} case missing`);
    assert(/(Z|[+-]\d\d:\d\d)$/.test(event.start) && Number.isFinite(Date.parse(event.start)), `Hearing ${event.id} requires an explicit timezone`);
    assert(Date.parse(event.end) > Date.parse(event.start), `Hearing ${event.id} end must follow start`);
    assert(typeof event.endIsEstimate === 'boolean', `Hearing ${event.id} must disclose estimated end times`);
  }
  for (const record of data.evidence) {
    sourceRefs(record, `Evidence ${record.id}`);
    assert(cases.has(record.caseId), `Evidence ${record.id} case missing`);
    assert(['Documented request', 'Open question', 'Procedure verified'].includes(record.status), `Evidence ${record.id} status invalid`);
    assert(date(record.reviewedAt), `Evidence ${record.id} requires review date`);
  }
  const demands = new Set(data.cases.flatMap(c => c.demands.map(item => item.id)));
  for (const row of data.accountability) { assert(demands.has(row.demandId), `Unknown demand ${row.demandId}`); sourceRefs(row, `Demand ${row.demandId}`, false); }
  if (data.organizing.signupUrl !== null) assert(https(data.organizing.signupUrl), 'Signup URL must be null or HTTPS');
  for (const key of ['partnerUrl', 'networkUrl', 'updatesUrl']) assert(https(data.organizing[key]), `Organizing ${key} must be HTTPS`);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const data = JSON.parse(await readFile(new URL('../web/data/campaign.json', import.meta.url), 'utf8'));
    const errors = validateCampaign(data);
    if (errors.length) { errors.forEach(error => console.error(`✗ ${error}`)); process.exitCode = 1; }
    else console.log(`Validated ${data.cases.length} case, ${data.sources.length} sources, ${data.evidence.length} evidence records and ${data.hearings.length} hearings.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
