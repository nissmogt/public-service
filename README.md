# Public Service

**Follow the money. Have a say.**

An independent utility accountability dashboard, starting with SoCalGas’s proposed 2028–2031 General Rate Case, **A.26-06-014**. It connects source documents, transparent calculations, unresolved research questions and ways for customers to participate.

This is a working static application, not an automated investigation or a mailing-list service. No accounts, API keys, external fonts, analytics or paid hosting are needed to run it. It is not affiliated with the CPUC, SoCalGas, Sempra or TURN.

## Run locally

Use **Node.js 22 or newer**. There are no dependencies to install.

```sh
npm run dev
```

Open `http://localhost:3000`. Set `PORT` to choose another port. Use an HTTP server, not a `file://` URL; the app loads its public dataset with `fetch`.

```sh
npm run check
```

This validates source references and financial reconciliation, runs the Node test suite, and copies the public assets into `dist/`. `npm run build` can also be used on its own. All asset paths are relative so the build works beneath a GitHub Pages repository path.

## What works

- Proposed annual revenue trajectory with the baseline, units and calculation disclosed.
- Full 2028 cost composition, explicitly distinguished from the additional revenue request.
- Searchable evidence records with original sources, document locators and review dates.
- Public accountability tracker; unknown responses are labeled **Not logged**.
- Editable comment builder with copy and text download; users submit on the official CPUC page.
- Individual and combined `.ics` hearing downloads with correct Pacific-to-UTC conversion.
- Dated, aggregate public comment snapshots for the related SoCalGas and SDG&E dockets.
- Links to existing organizing efforts, official updates, and public contribution forms.
- A stale-record warning after 14 days, and past-hearing handling.
- Mobile layouts, keyboard navigation, source dialogs and reduced-motion support.

The structured comment builder does **not** call an AI service or send drafts to a server. Source records are maintained through reviewed repository changes; there is no live comment scraper. The initial observations date to **October 28, 2026** and must not be presented as current forever.

## Publish with GitHub Pages

Publishing is available through `.github/workflows/pages.yml`. It runs validation and tests before deploying only `dist/`.

1. In this repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Open **Actions → Publish dashboard → Run workflow**, selecting `main`.
3. The successful deployment job reports the actual public URL. Do not advertise a URL until deployment succeeds.

Publication is manual by default. The separate **Check public record** workflow runs on pushes to `main` and pull requests. Automatic publishing can be added to the Pages workflow once the editorial review process is established.

The GitHub connector does not expose the repository administration operation required to enable Pages. No personal access token is needed in this repository; use the repository’s Pages settings for that one-time step.

## Update the record

Edit [`web/data/campaign.json`](web/data/campaign.json), then run `npm run check` and open a pull request.

Each claim needs a source ID, original URL, a precise document locator and a review date. A utility’s testimony establishes what it requested, not that the request is justified. Do not relabel an assertion as an independently verified result. See [research standards](docs/METHODOLOGY.md) and [contribution instructions](CONTRIBUTING.md).

The aggregate comment counts are **entries, not unique individuals**, not verified opposition totals, and not a representative survey. Do not scrape commenter names into contact lists or commit individual comment bodies.

## Connect a voluntary signup

The project intentionally does not collect contact information. To connect an existing organizer-owned form:

1. Configure a consent-based form with an unsubscribe process and a clear privacy notice in the service of your choice.
2. Set `organizing.signupUrl` in the public dataset to the form’s HTTPS URL.
3. Run the checks and publish. The organizing section will display an external opt-in link.

Keep service credentials and subscriber exports out of the repository. A separate backend, moderation process and data policy are required before adding contact collection or bill uploads. See [privacy](docs/PRIVACY.md).

## Project layout

```text
web/                  Public website assets
  data/campaign.json  Reviewed public record and configuration
  model.js            Calculations, filtering, drafting and calendar generation
  app.js              Interactive interface
scripts/              Local server, validator and static build
tests/                Data, finance, calendar and drafting tests
docs/                 Research standards, privacy and implementation roadmap
.github/              Checks, manual publishing and contribution forms
```

The first release focuses on SoCalGas. SDG&E appears only as a related case, not a second fully researched dashboard. Glendale water and electricity require their own sources, decision-makers and review before being added.

See [the roadmap](docs/ROADMAP.md) for organizing integrations, document ingestion and human-reviewed AI research work.
