# outbound-skills

Claude Code skills for outbound lead generation: building qualified prospect lists, expanding hard-to-research niches, and scraping leads from multiple platforms.

## Skills

### list-builder

Meta skill for end-to-end lead list building. Orchestrates discovery (Prospeo, GetLeads, Blitz, Google Maps, plus lookalike snowballing via list-expander), AI qualification with live-website verification, uncapped contact pulls, and email validation with MillionVerifier before anything is sent. Starts from a 7-line intake brief and outputs to Postgres, Google Sheet, or CSV.

### list-expander

Expands a hard-to-build niche list from about ten known-good seed companies into a full qualified TAM. Works bottom-up: fingerprints how good-fit companies actually appear in database filters, generates lookalikes (Prospeo company_lookalike, Exa findSimilar, Parallel.ai entity search), mines wide-net filters with a precision/volume scorecard, then pulls, AI-qualifies, and live-website verifies at scale. For use when a vertical list feels too small or good-fit companies don't show up in keyword searches.

### apify-lead-generation

Scrapes leads from multiple platforms using Apify Actors. Selects the right Actor for maps, search, social, or video platforms, then extracts outreach-ready contact data.

## Install

Copy a skill folder into your Claude Code skills directory:

- Project level: `<project>/.claude/skills/<skill-name>/`
- User level: `~/.claude/skills/<skill-name>/`

Each skill is self-contained: `SKILL.md` plus its references, scripts, and templates.
