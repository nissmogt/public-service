import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { validateCampaign } from './validate.mjs';

const root = new URL('../', import.meta.url);
const campaign = JSON.parse(await readFile(new URL('web/data/campaign.json', root), 'utf8'));
const errors = validateCampaign(campaign);
if (errors.length) throw new Error(`Invalid campaign data:\n${errors.join('\n')}`);
// Only public web assets are copied; repository metadata and future secrets are excluded.
const target = new URL('dist/', root);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('web/', root), target, { recursive: true });
console.log('Built static site in dist/ (no dependencies or external assets).');
