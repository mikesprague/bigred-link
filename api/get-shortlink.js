import Bugsnag from '@bugsnag/js';

import {
  initMongoDb,
  checkIfShortIdExists,
} from '../src/modules/api-helpers.js';

const { MONGO_DB_URL, BUGSNAG_KEY } = process.env;

Bugsnag.start(BUGSNAG_KEY);

export default async (req, res) => {
  const { short_id: shortId } = req.query;

  if (shortId && shortId.length === 7) {
    const dbClient = await initMongoDb(MONGO_DB_URL);
    const shortIdExists = await checkIfShortIdExists(dbClient, shortId);
    try {
      const { original_url } = shortIdExists;
      return res.redirect(302, original_url);
    } catch (error) {
      return res.status(400).json({
        errorCode: 400,
        errorMessage: `Invalid Request: No matching short link found for /${shortId}`,
      });
    }
  }
  return res.status(404).json({
    errorCode: 404,
    errorMessage: '404 Not Found'
  });
};
