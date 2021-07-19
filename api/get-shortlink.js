const Bugsnag = require('@bugsnag/js');

const {
  initMongoDb,
  checkIfShortIdExists,
} = require('../src/modules/api-helpers');

const { MONGO_DB_URL, BUGSNAG_KEY } = process.env;

Bugsnag.start(BUGSNAG_KEY);

module.exports = async (req, res) => {
  const { short_id: shortId } = req.query;

  if (shortId && shortId.length === 7) {
    const dbClient = await initMongoDb(MONGO_DB_URL);
    const shortIdExists = await checkIfShortIdExists(dbClient, shortId);
    console.log(shortIdExists);
    if (shortIdExists === null) {
      return res.status(400).json({
        errorCode: 400,
        errorMessage: `Invalid Request: No matching short link found for /${shortId}`,
      });
    }
    return res.redirect(302, shortIdExists.original_url);
  }
  return res.status(404).send('404 Not Found');
};
