# Contributing

Start with one narrow, checkable contribution: a better document locator, a corrected figure, a project-cost comparison, or a user-interface fix.

## Research contributions

Open an **Evidence or correction** issue with an original public source, a page or table reference, the exact claim it supports, and any limitations. Public issues are not a place to submit private bills, personal contact information or unverified accusations.

For a dataset pull request:

1. Read [the research standards](docs/METHODOLOGY.md).
2. Add or update a source record with publisher, URL, locator and review date.
3. Add the source ID to each supported record. Preserve old dates unless those records were actually rechecked.
4. Record the reason for the change in the pull request. Distinguish a correction from a new filing or updated snapshot.
5. Run `npm run check`.

A second reviewer is recommended for financial claims and consequential allegations. Findings should be reproducible from the original source.

## Code contributions

Use Node 22+. Run `npm run dev` for preview and `npm run check` before submitting. Keep dependencies and data collection minimal. Test user-visible behavior rather than duplicating implementation details in tests.

Avoid anonymous bulk commenting, fake participation, auto-submission to the CPUC, or contact harvesting. The goal is informed, voluntary participation and a better evidentiary record.
