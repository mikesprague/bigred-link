import Bugsnag from '@bugsnag/js';
import dns from 'dns';

import { shortenURL, handleError } from '../src/modules/api-helpers.js';

const { BUGSNAG_KEY } = process.env;

Bugsnag.start(BUGSNAG_KEY);

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }
  let originalUrl;
  try {
    originalUrl = new URL(req.body.link);
  } catch (error) {
    Bugsnag.notify(error);
    return res.status(400).json({ error: 'Invalid URL' });
  }
  dns.lookup(originalUrl.hostname, (err) => {
    if (err) {
      return res.status(404).send({ error: 'URL Not Found' });
    }
    shortenURL(originalUrl.href)
      .then((result) => {
        const doc = result.value;
        return res.status(200).json({
          original_url: doc.original_url,
          short_id: doc.short_id,
        });
      })
      .catch((error) => {
        handleError(error);
      });
  });
};
