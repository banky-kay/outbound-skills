---
name: apify-lead-generation
description: "Scrape leads from multiple platforms using Apify Actors."
risk: critical
source: community
date_added: "2026-09-04"
---

# Lead Generation

Scrape leads from multiple platforms using Apify Actors.

## When to Use
- You need business, creator, or contact leads from maps, search, social, or video platforms.
- The task involves selecting an Apify Actor to discover prospects and extract outreach data.
- You need exported lead data plus a concise summary of lead quality or segmentation.

## Prerequisites
(No need to check it upfront)

- `.env` file with `APIFY_TOKEN`
- Node.js 20.6+ (for native `--env-file` support)
- `mcpc` CLI tool: `npm install -g @apify/mcpc`

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Determine lead source (select Actor)
- [ ] Step 2: Fetch Actor schema via mcpc
- [ ] Step 3: Ask user preferences (format, filename)
- [ ] Step 4: Run the lead finder script
- [ ] Step 5: Summarize results
```

### Step 1: Determine Lead Source

Select the appropriate Actor based on user needs:

| User Need | Actor ID | Best For |
|-----------|----------|----------|
| Local businesses | `compass/crawler-google-places` | Restaurants, gyms, shops, roofing, home services |
| Contact enrichment | `vdrmota/contact-info-scraper` | Emails, phones from URLs |
| Instagram profiles | `apify/instagram-profile-scraper` | Influencer discovery |
| Instagram posts/comments | `apify/instagram-scraper` | Posts, comments, hashtags, places |
| Instagram search | `apify/instagram-search-scraper` | Places, users, hashtags discovery |
| TikTok videos/hashtags | `clockworks/tiktok-scraper` | Comprehensive TikTok data extraction |
| TikTok hashtags/profiles | `clockworks/free-tiktok-scraper` | Free TikTok data extractor |
| TikTok user search | `clockworks/tiktok-user-search-scraper` | Find users by keywords |
| TikTok profiles | `clockworks/tiktok-profile-scraper` | Creator outreach |
| TikTok followers/following | `clockworks/tiktok-followers-scraper` | Audience analysis, segmentation |
| Facebook pages | `apify/facebook-pages-scraper` | Page details, contact info |
| YouTube channels | `streamers/youtube-scraper` | Channel discovery, contact info |
| LinkedIn profiles | `anchor/linkedin-profile-scraper` | Professional outreach |
| Google Search results | `apify/google-search-scraper` | Research, competitor discovery |

### Step 2: Fetch Actor Schema via mcpc

Run this command to get the Actor's input schema:

```bash
npx @apify/mcpc schema ACTOR_ID
```

Use the schema to build a valid `--input` JSON for Step 4.

### Step 3: Ask User Preferences

Before running, confirm:
- **Output format**: CSV (recommended for Clay/Instantly import) or JSON
- **Output filename**: e.g. `roofing-leads-uk.csv`
- **Result limit**: How many leads to pull (default 100)

### Step 4: Run the Lead Finder Script

```bash
node --env-file=.env .claude/skills/apify-lead-generation/reference/scripts/run_actor.js \
  --actor "ACTOR_ID" \
  --input '{"key": "value"}' \
  --output leads.csv \
  --format csv
```

For a quick preview of the top 5 results (no file saved):

```bash
node --env-file=.env .claude/skills/apify-lead-generation/reference/scripts/run_actor.js \
  --actor "ACTOR_ID" \
  --input '{"key": "value"}'
```

### Step 5: Summarize Results

After the run completes:
- Report how many leads were returned
- Show a sample of the data (top 3-5 rows)
- Note data quality: which fields are populated vs empty
- Suggest next step: load into Clay for enrichment, Instantly for outreach, or Facebook Ads for targeting
