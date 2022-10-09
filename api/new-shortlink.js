import Bugsnag from '@bugsnag/js';

import {
  getSafeBrowsingResults,
  handleError,
  shortenURL,
} from '../src/modules/api-helpers.js';

const { NODE_ENV, BUGSNAG_KEY } = process.env;

if (NODE_ENV === 'production') {
  Bugsnag.start({ apiKey: BUGSNAG_KEY });
}

// eslint-disable-next-line consistent-return
export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  let originalUrl;

  try {
    originalUrl = new URL(req.body.link);
  } catch (error) {
    handleError(error);
    res.status(200).json({ errorCode: 400, errorMessage: 'Invalid URL' });
  }

  const { clientData } = req.body;

  try {
    const safeBrowsingData = await getSafeBrowsingResults(originalUrl.href);

    if (Object.keys(safeBrowsingData).length) {
      await shortenURL(originalUrl.href, clientData, safeBrowsingData);
      res
        .status(200)
        .json({ errorCode: 400, errorMessage: 'URL is reported as unsafe' });
    }
  } catch (error) {
    handleError(error);
  }

  try {
    const result = await shortenURL(originalUrl.href, clientData);

    res.setHeader('Cache-Control', 'max-age=300, s-maxage=300');
    res.status(200).json({
      original_url: result.original_url,
      short_id: result.short_id,
    });
  } catch (error) {
    handleError(error);
  }
};
