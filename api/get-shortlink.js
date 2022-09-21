import Bugsnag from '@bugsnag/js';

import {
  checkIfShortIdExists,
  initMongoDb,
} from '../src/modules/api-helpers.js';

const { NODE_ENV, MONGO_DB_URL, BUGSNAG_KEY } = process.env;

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
    const dbClient = await initMongoDb(MONGO_DB_URL);
    const shortIdExists = await checkIfShortIdExists(dbClient, shortId);
    try {
      const { original_url } = shortIdExists;
      return res.redirect(original_url);
    } catch (error) {
      res.status(400).json({
        errorCode: 400,
        errorMessage: `Invalid Request: No matching short link found for /${shortId}`,
      });
    }
  }
  res.status(404).json({
    errorCode: 404,
    errorMessage: '404 Not Found',
  });
};
