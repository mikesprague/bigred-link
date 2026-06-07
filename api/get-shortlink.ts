import Bugsnag from '@bugsnag/js';

import {
  checkIfShortIdExists,
  initDatabase,
} from '../src/modules/api-helpers.js';

const { NODE_ENV, BUGSNAG_KEY, TURSO_DB_TABLE } = process.env;

if (NODE_ENV === 'production') {
  // @ts-ignore
  Bugsnag.start({ apiKey: BUGSNAG_KEY as string });
}

export default async (req: Request, res: Response) => {
  // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
  const { short_id: shortId, healthcheck } = req.query;

  if (healthcheck) {
    // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
    return res.status(200).json({
      status: 'API is up and running',
    });
  }

  if (shortId && shortId.length === 7) {
    const dbConn = initDatabase();
    const shortIdExists = await checkIfShortIdExists(dbConn, shortId);

    try {
      const { original_url: url, suspicious, visits } = shortIdExists;

      if (suspicious) {
        // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
        return res.status(400).json({
          errorCode: 400,
          errorMessage: 'Original URL has been reported as unsafe',
        });
      }

      let visitsCount = 1;

      if (visits && Number.isInteger(visits)) {
        visitsCount = Number(visits) + 1;
      }

      // oxlint-disable-next-line no-unused-vars
      let updateResults = await dbConn.prepare(
        `UPDATE "${TURSO_DB_TABLE}" SET visits = ? WHERE short_id = ?`
      );
      updateResults = await updateResults.run([visitsCount, shortId]);

      // if (updateResults.error) {
      //   console.error(updateResults.error);
      // }

      // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
      return res.redirect(url);
    } catch (error) {
      console.error(
        `Invalid Request: No matching short link found for /${shortId}`,
        error
      );
    }
  }

  // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
  return res.status(404).json({
    errorCode: 404,
    errorMessage: '404 Not Found',
  });
};
