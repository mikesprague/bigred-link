import Bugsnag from '@bugsnag/js';

import {
  checkIfShortIdExists,
  initSupabase,
} from '../src/modules/api-helpers.js';

const { NODE_ENV, BUGSNAG_KEY, SUPABASE_DB_TABLE } = process.env;

if (NODE_ENV === 'production') {
  Bugsnag.start({ apiKey: BUGSNAG_KEY });
}

export default async (req, res) => {
  const { short_id: shortId, healthcheck } = req.query;

  if (healthcheck) {
    return res.status(200).json({
      status: 'API is up and running',
    });
  }

  if (shortId && shortId.length === 7) {
    const supabase = await initSupabase();
    const shortIdExists = await checkIfShortIdExists(supabase, shortId);

    try {
      const { original_url: url, suspicious, visits } = shortIdExists;

      if (suspicious) {
        return res.status(400).json({
          errorCode: 400,
          errorMessage: 'Original URL has been reported as unsafe',
        });
      }

      let visitsCount = 1;

      if (visits && Number.isInteger(visits)) {
        visitsCount = Number(visits) + 1;
      }

      const updateResults = await supabase
        .from(SUPABASE_DB_TABLE)
        .update([
          {
            visits: visitsCount,
          },
        ])
        .match({ short_id: shortId });

      if (updateResults.error) {
        console.error(updateResults.error);
      }

      return res.redirect(url);
    } catch (error) {
      console.error(
        `Invalid Request: No matching short link found for /${shortId}`,
        error
      );
    }
  }

  return res.status(404).json({
    errorCode: 404,
    errorMessage: '404 Not Found',
  });
};
