import Bugsnag from '@bugsnag/js';

import {
  getSafeBrowsingResults,
  handleError,
  shortenURL,
} from '../src/lib/api-helpers';

const { NODE_ENV, BUGSNAG_KEY } = process.env;

if (NODE_ENV === 'production') {
  // @ts-ignore
  Bugsnag.start({ apiKey: BUGSNAG_KEY as string });
}

export default async (req: Request, res: Response) => {
  if (req.method === 'OPTIONS') {
    // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
    return res.status(200).send('');
  }

  let originalUrl;

  try {
    // @ts-ignore (incorrect again)
    originalUrl = new URL(req.body?.link) as URL;
  } catch (error) {
    handleError(error as Error);
    // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
    res.status(200).json({ errorCode: 400, errorMessage: 'Invalid URL' });
  }
  // @ts-ignore (incorrect again - should prob type incoming request body and refer to it)
  const { clientData } = req.body;

  try {
    const safeBrowsingData = await getSafeBrowsingResults(
      originalUrl?.href as string
    );

    if (safeBrowsingData && Object.keys(safeBrowsingData).length) {
      await shortenURL(
        originalUrl?.href as string,
        clientData,
        safeBrowsingData
      );
      return (
        res
          // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
          .status(200)
          .json({ errorCode: 400, errorMessage: 'URL is reported as unsafe' })
      );
    }
  } catch (error) {
    handleError(error as Error);
  }

  try {
    const result = await shortenURL(originalUrl?.href as string, clientData);

    // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
    res.setHeader('Cache-Control', 'max-age=300, s-maxage=300');
    // @ts-ignore (incorrect - https://vercel.com/docs/functions/runtimes/node-js#node.js-request-and-response-objects)
    res.status(200).json({
      original_url: result.original_url,
      short_id: result.short_id,
    });
  } catch (error) {
    handleError(error as Error);
  }
};
