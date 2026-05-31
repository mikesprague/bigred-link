import fs from 'node:fs';

import dotenv from 'dotenv';

import { initDatabase, getAllShortLinks } from '../modules/api-helpers.js';

dotenv.config();

const { hrtime } = process;

(async () => {
  const debugStart = hrtime();

  const config = {
    fileName: 'bigred-links-db-backup.json',
    workingDir: './',
  };

  const dbConn = initDatabase();

  const allShortLinks = await getAllShortLinks(dbConn);

  if (allShortLinks.length > 0) {
    await fs.writeFileSync(
      `${config.workingDir}${config.fileName}`,
      JSON.stringify(allShortLinks, null, 2)
    );
  }

  const debugEnd = hrtime(debugStart);

  console.log(
    `Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1000000}ms`
  );
})();
