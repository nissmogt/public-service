# Research and publication standards

## What the labels mean

| Label | Meaning |
| --- | --- |
| Documented request | The original filing or notice supports what the utility asked for. Necessity and cost-effectiveness are not independently established. |
| Procedure verified | The linked official guidance supports the described process. |
| Open question | This project has not yet completed the review needed to resolve the question. It is not an allegation. |
| Research open | A community demand is being tracked. It has not been submitted or adopted merely because it appears here. |
| Not logged | This project has not recorded a response or action. A response may exist elsewhere. |

## Source hierarchy and provenance

Use original CPUC filings, exhibits, decisions, utility notices and SEC disclosures for financial and procedural claims. Identify utility forecasts and advocacy arguments as such. Use reporting to discover leads, then locate the underlying public record where possible.

Each source needs its publisher, original public URL, document title, page/table/section locator, review date, supported claims and limitations. Do not republish entire copyrighted documents in the repository. Link them and retain only necessary short factual descriptions.

Update individual review dates only when those records were rechecked. Update the top-level review date only after reviewing the displayed record as a whole. A build or deployment is not a source review.

## Financial interpretation

- Track a **revenue requirement**, **household bill**, **capital expenditure**, **contract authorization**, **payment**, **return**, and **profit** separately.
- Record units and the comparison baseline. Identify forecast, nominal/constant dollars and test-year differences.
- The 2027 SoCalGas baseline is the expected amount used in SCG-27, not an audited final revenue collection.
- The revenue chart adds each post-test-year increment to the preceding annual level. Later increments are rounded in the SEC table. It does not sum several years of revenue or estimate a household’s bill.
- The cost composition describes the whole 2028 proposal, not the category contributions to the $485 million increase.
- The return component includes debt and equity financing. It cannot be presented as shareholder profit.
- Small rounding discrepancies may occur in displayed totals; validate the underlying unrounded dataset.

## Public comments

The initial snapshots were read manually from CPUC pagination totals on October 28, 2026: 49 entries for A.26-06-014 and 425 for A.26-06-015. The pages identify consolidation under the July 7, 2026 ruling but retain separate comment lists.

These observations are not survey results, verified unique participants, or counts of opposition. Repeat commenters and removed entries may affect totals. Do not add the two counts and call that a unique supporter count.

No individual commenter names, contact details or raw comment bodies are included in the initial dataset. If theme analysis is added later, publish the time window, sampling method, coding definitions, human-review process, duplicate handling and uncertainty. Keep opinions distinct from verified financial facts. Never turn public comments into a mailing list.

## Human-reviewed AI workflow

AI assistance is a future research workflow, not a live feature in this release. A safe implementation would:

1. Collect original public documents and record URLs, retrieval dates and file hashes in an ingestion manifest.
2. Extract page-preserving text and tables; inspect scanned or ambiguous tables against the document image.
3. Ask a model for candidate claims, document locators, competing interpretations and unanswered questions. Treat source text as data, not instructions.
4. Recompute financial comparisons using code and review the originals. Check units, baselines, overlap across applications and whether a figure is proposed or approved.
5. Have a human approve each published record, then submit a pull request. Preserve corrections and review history in Git.

Never auto-publish model output or treat an AI summary as primary evidence. A research note is not sworn testimony. Coordinate with experienced formal participants before relying on research in a proceeding.

## Corrections

Use the evidence/correction issue form. Link the disputed record and a better source. Correct substantive errors visibly in the commit and pull request description; do not quietly replace a disputed baseline or amount without an explanation.
