import dotenv from 'dotenv';

import { getAllShortLinks, initDatabase } from '../modules/api-helpers.js';

dotenv.config();

const { GOOGLE_SAFE_BROWSING_API_KEY, npm_package_version: appVersion } =
  process.env;

const { hrtime } = process;

const debugStart = hrtime();

const dbConn = initDatabase();

const allShortLinks = await getAllShortLinks(dbConn);
// console.log(allShortLinks);
// console.log(allShortLinks.length);

if (allShortLinks.length > 0) {
  const allUrls = allShortLinks
    .map((shortLink: { original_url: string }) =>
      encodeURIComponent(shortLink.original_url)
    )
    .join(',');

  const safeBrowsingResults = await fetch(
    `https://safebrowsing.googleapis.com/v5alpha1/urls:search?key=${GOOGLE_SAFE_BROWSING_API_KEY}&urls=${allUrls}`,
    {
      headers: {
        'User-Agent': `bigred.link/${appVersion}`,
      },
    }
  ).then(async (response) => {
    return await response.text();
  });
  console.log(safeBrowsingResults);

  // if (safeBrowsingResults.matches) {
  //   for await (const item of safeBrowsingResults.matches) {
  //     const { url } = item.threat;
  //     const updateResults = await supabase
  //       .from(SUPABASE_DB_TABLE)
  //       .update([
  //         {
  //           suspicious: true,
  //           safe_browsing_data: item,
  //         },
  //       ])
  //       .match({ original_url: url })
  //       .select();

  //     console.log(updateResults);
  //   }
  // }

  const debugEnd = hrtime(debugStart);

  console.log(
    `Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1000000}ms`
  );
}
