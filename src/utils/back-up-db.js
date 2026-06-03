import fs from 'node:fs';

import dotenv from 'dotenv';

import { initDatabase, getAllShortLinks } from '../modules/api-helpers.js';

const { hrtime } = process;

const debugStart = hrtime();

const logPrefix = '[bigred-link:db-backup]';

console.log(`${logPrefix} Starting database backup...`);
dotenv.config();
console.log(`${logPrefix} Environment variables loaded`);

const config = {
  fileName: 'bigred-links-db-backup.json',
  workingDir: './',
};
console.log(`${logPrefix} Configuration set`);

const dbConn = initDatabase();
console.log(`${logPrefix} Database connection initialized`);

const allShortLinks = await getAllShortLinks(dbConn);
console.log(`${logPrefix} Retrieved ${allShortLinks.length} short links`);

if (allShortLinks.length > 0) {
  fs.writeFileSync(
    `${config.workingDir}${config.fileName}`,
    JSON.stringify(allShortLinks, null, 2)
  );
  console.log(`${logPrefix} Database backup written to: ${config.fileName}`);
}

const debugEnd = hrtime(debugStart);
console.log(`${logPrefix} Database backup completed`);

console.log(
  `${logPrefix} Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1000000}ms`
);
