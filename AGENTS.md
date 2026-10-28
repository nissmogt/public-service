# Instructions for contributors and coding agents

- This is an independent utility research and participation tool. Preserve the distinction between proposed, approved, spent, and independently verified figures.
- Read `docs/METHODOLOGY.md` before changing claims or source data.
- `web/data/campaign.json` is the public, reviewed dataset. Every substantive record needs original source IDs, document locators, units, dates and an accurate status.
- Do not infer wrongdoing, conflicts or contractor profits from contract values, policy decisions, political contributions or a utility's revenue alone.
- Do not commit subscriber lists, private bills, account numbers, personal addresses, API credentials, individual commenter profiles or raw comment bodies.
- Keep comment drafts browser-local. Do not add remote AI calls, analytics or data collection without a documented change in privacy behavior.
- Keep static asset paths relative and verify repository-subpath hosting.
- Use Node built-ins when adequate. There are no runtime dependencies. Run `npm run check` after code or dataset changes and `node --check web/app.js` after interface edits.
- Check responsive layout and primary actions when browser preview is available. Test calculations and calendar timezones when altering their logic.
- New source data must be reviewed before public publication. Automation may propose changes; it must not silently publish AI claims.
- Only advertise a live deployment after verifying a successful deployment result. Preserve manual publication unless explicitly changed.
