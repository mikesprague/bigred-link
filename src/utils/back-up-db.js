import fs from 'node:fs';
import dotenv from 'dotenv';

import { initSupabase } from '../modules/api-helpers.js';

dotenv.config();

const { SUPABASE_DB_TABLE } = process.env;

const { hrtime } = process;

(async () => {
  const debugStart = hrtime();

  const config = {
    fileName: 'bigred-links-db-backup.json',
    workingDir: './',
  };

  const supabase = await initSupabase();

  const getAllShortLinks = await supabase.from(SUPABASE_DB_TABLE).select();

  if (getAllShortLinks.data) {
    await fs.writeFileSync(
      `${config.workingDir}${config.fileName}`,
      JSON.stringify(getAllShortLinks.data, null, 2)
    );
  }

  const debugEnd = hrtime(debugStart);

  console.log(
    `Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1000000}ms`
  );
})();
