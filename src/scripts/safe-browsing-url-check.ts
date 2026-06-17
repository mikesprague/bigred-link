import dotenv from 'dotenv';

import { getAllShortLinks, initDatabase } from '../lib/api-helpers.js';
import { checkUrlsAgainstSafeBrowsing } from '../lib/safe-browsing.js';

dotenv.config();

const {
  GOOGLE_SAFE_BROWSING_API_KEY,
  TURSO_DB_TABLE,
  npm_package_version: appVersion,
} = process.env;

if (!GOOGLE_SAFE_BROWSING_API_KEY) {
  throw new Error('GOOGLE_SAFE_BROWSING_API_KEY is not set');
}
if (!TURSO_DB_TABLE) {
  throw new Error('TURSO_DB_TABLE is not set');
}

const logPrefix = '[bigred-link:safe-browsing]';
const { hrtime } = process;
const debugStart = hrtime();

const dbConn = initDatabase();
const allShortLinks = (await getAllShortLinks(dbConn)) as Array<{
  original_url: string;
}>;

console.log(`${logPrefix} Checking ${allShortLinks.length} URLs`);

if (allShortLinks.length === 0) {
  process.exit(0);
}

const urls = allShortLinks.map((row) => row.original_url);

const matches = await checkUrlsAgainstSafeBrowsing(urls, {
  apiKey: GOOGLE_SAFE_BROWSING_API_KEY,
  userAgent: `bigred.link/${appVersion}`,
});

console.log(`${logPrefix} ${matches.size} URL(s) flagged as unsafe`);

const updateStatement = await dbConn.prepare(
  `UPDATE "${TURSO_DB_TABLE}" SET suspicious = ?, safe_browsing_data = ?, updated_at = CURRENT_TIMESTAMP WHERE original_url = ?`
);

for (const [originalUrl, match] of matches) {
  console.log(
    `${logPrefix} unsafe: ${originalUrl} -> ${match.detail.threatType} (matched expression: ${match.matchedExpression})`
  );
  await updateStatement.run([1, JSON.stringify(match), originalUrl]);
}

const debugEnd = hrtime(debugStart);
console.log(
  `${logPrefix} Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1_000_000}ms`
);
