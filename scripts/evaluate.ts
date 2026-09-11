import fs from 'node:fs/promises';
import path from 'node:path';
import { generateKitPipeline } from '../lib/pipeline';

async function runCase(input: { companyUrl: string; jobDescription: string; daysToInterview: number }) {
  try {
    const kit = await generateKitPipeline(input);
    return { status: 'ok', kit };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  const [, , inputArg = 'cases.json', outputArg = 'kits.json'] = process.argv;

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputPath = path.resolve(process.cwd(), outputArg);

  const raw = await fs.readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw);
  const cases = Array.isArray(parsed) ? parsed : [parsed];

  const results = await Promise.allSettled(
    cases.map((entry) =>
      runCase({
        companyUrl: String(entry.companyUrl || ''),
        jobDescription: String(entry.jobDescription || ''),
        daysToInterview: Number(entry.daysToInterview || 1),
      }),
    ),
  );

  const output = results.map((result) =>
    result.status === 'fulfilled' ? result.value : { status: 'failed', error: 'Case rejected' },
  );

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Wrote ${output.length} results to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
