#!/usr/bin/env node
/**
 * Apify Actor Runner - Runs Apify actors and exports results.
 *
 * Usage:
 *   # Quick answer (display in chat, no file saved)
 *   node --env-file=.env scripts/run_actor.js --actor ACTOR_ID --input '{}'
 *
 *   # Export to file
 *   node --env-file=.env scripts/run_actor.js --actor ACTOR_ID --input '{}' --output leads.csv --format csv
 */

import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';

// User-Agent for tracking skill usage in Apify analytics
const USER_AGENT = 'apify-agent-skills/apify-lead-generation-1.1.11';

// Parse command-line arguments
function parseCliArgs() {
    const options = {
        actor: { type: 'string', short: 'a' },
        input: { type: 'string', short: 'i' },
        output: { type: 'string', short: 'o' },
        format: { type: 'string', short: 'f', default: 'csv' },
        timeout: { type: 'string', short: 't', default: '600' },
        'poll-interval': { type: 'string', default: '5' },
        help: { type: 'boolean', short: 'h' },
    };

    const { values } = parseArgs({ options, allowPositionals: false });

    if (values.help) {
        printHelp();
        process.exit(0);
    }

    if (!values.actor) {
        console.error('Error: --actor is required');
        printHelp();
        process.exit(1);
    }

    if (!values.input) {
        console.error('Error: --input is required');
        printHelp();
        process.exit(1);
    }

    return {
        actor: values.actor,
        input: values.input,
        output: values.output,
        format: values.format || 'csv',
        timeout: parseInt(values.timeout, 10),
        pollInterval: parseInt(values['poll-interval'], 10),
    };
}

function printHelp() {
    console.log(`
Apify Actor Runner - Run Apify actors and export results

Usage:
  node --env-file=.env scripts/run_actor.js --actor ACTOR_ID --input '{}'

Options:
  --actor, -a       Actor ID (e.g., compass/crawler-google-places) [required]
  --input, -i       Actor input as JSON string [required]
  --output, -o      Output file path (optional - if not provided, displays quick answer)
  --format, -f      Output format: csv, json (default: csv)
  --timeout, -t     Max wait time in seconds (default: 600)
  --poll-interval   Seconds between status checks (default: 5)
  --help, -h        Show this help message

Output Formats:
  JSON (all data)     --output file.json --format json
  CSV (all data)      --output file.csv --format csv
  Quick answer        (no --output) - displays top 5 in chat

Examples:
  # Quick answer - display top 5 in chat
  node --env-file=.env scripts/run_actor.js \\
    --actor "compass/crawler-google-places" \\
    --input '{"searchStringsArray": ["roofing companies"], "locationQuery": "London, UK"}'

  # Export all data to CSV
  node --env-file=.env scripts/run_actor.js \\
    --actor "compass/crawler-google-places" \\
    --input '{"searchStringsArray": ["roofing companies"], "locationQuery": "London, UK"}' \\
    --output roofing-leads-uk.csv --format csv
`);
}

// Convert actor ID format for API
function toApiActorId(actorId) {
    return actorId.replace('/', '~');
}

// Start an actor run and return { runId, datasetId }
async function startActor(token, actorId, inputJson) {
    const apiActorId = toApiActorId(actorId);
    const url = `https://api.apify.com/v2/acts/${apiActorId}/runs?token=${encodeURIComponent(token)}`;

    let data;
    try {
        data = JSON.parse(inputJson);
    } catch (e) {
        console.error('Error: --input must be valid JSON');
        process.exit(1);
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': USER_AGENT,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to start actor: ${res.status} ${err}`);
        process.exit(1);
    }

    const json = await res.json();
    return {
        runId: json.data.id,
        datasetId: json.data.defaultDatasetId,
    };
}

// Poll until run finishes
async function waitForRun(token, runId, timeout, pollInterval) {
    const start = Date.now();
    while (true) {
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed > timeout) {
            console.error(`Timeout: actor run did not complete within ${timeout}s`);
            process.exit(1);
        }

        const url = `https://api.apify.com/v2/actor-runs/${runId}?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const json = await res.json();
        const status = json.data.status;

        if (status === 'SUCCEEDED') return;
        if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
            console.error(`Actor run ended with status: ${status}`);
            process.exit(1);
        }

        console.log(`Status: ${status} (${Math.round(elapsed)}s elapsed)...`);
        await new Promise(r => setTimeout(r, pollInterval * 1000));
    }
}

// Fetch dataset items
async function fetchDataset(token, datasetId, format) {
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${encodeURIComponent(token)}&format=${format}&clean=true`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
        console.error(`Failed to fetch dataset: ${res.status}`);
        process.exit(1);
    }
    return res.text();
}

async function main() {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
        console.error('Error: APIFY_TOKEN not found. Make sure your .env file has APIFY_TOKEN=your_token');
        process.exit(1);
    }

    const args = parseCliArgs();

    console.log(`Starting actor: ${args.actor}`);
    const { runId, datasetId } = await startActor(token, args.actor, args.input);
    console.log(`Run ID: ${runId}`);

    await waitForRun(token, runId, args.timeout, args.pollInterval);
    console.log('Actor run completed. Fetching results...');

    const outputFormat = args.output ? args.format : 'json';
    const data = await fetchDataset(token, datasetId, outputFormat);

    if (args.output) {
        writeFileSync(args.output, data, 'utf8');
        console.log(`Results saved to: ${args.output}`);
    } else {
        // Quick answer: display top 5 items
        const items = JSON.parse(data);
        const preview = items.slice(0, 5);
        console.log(`\nTop ${preview.length} results (${items.length} total):`);
        console.log(JSON.stringify(preview, null, 2));
    }
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
