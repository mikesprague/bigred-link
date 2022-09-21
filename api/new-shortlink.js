import Bugsnag from '@bugsnag/js';

import { handleError, shortenURL } from '../src/modules/api-helpers.js';

const { NODE_ENV, BUGSNAG_KEY } = process.env;

if (NODE_ENV === 'production') {
  Bugsnag.start({ apiKey: BUGSNAG_KEY });
}

export default async (req, res) => {
  let originalUrl;

  try {
    originalUrl = new URL(req.body.link);
  } catch (error) {
    Bugsnag.notify(error);
    res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const result = await shortenURL(originalUrl.href);

    res.status(200).json({
      original_url: result.original_url,
      short_id: result.short_id,
    });
  } catch (error) {
    handleError(error);
  }
};
