import dotenv from 'dotenv';

import { initSupabase } from '../modules/api-helpers.js';

dotenv.config();

const {
  SUPABASE_DB_TABLE,
  GOOGLE_SAFE_BROWSING_API_KEY,
  npm_package_version: appVersion,
} = process.env;

const { hrtime } = process;

const debugStart = hrtime();

const supabase = await initSupabase();

const getAllShortLinks = await supabase.from(SUPABASE_DB_TABLE).select();

if (getAllShortLinks.data) {
  const allUrls = getAllShortLinks.data.map((shortLink) => ({
    url: shortLink.original_url,
  }));

  const postData = {
    client: {
      clientId: 'bigred.link',
      clientVersion: appVersion,
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
        'THREAT_TYPE_UNSPECIFIED',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: allUrls,
    },
  };

  // console.log(postData);

  const safeBrowsingResults = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    }
  ).then((response) => response.json());
  // console.log(safeBrowsingResults.matches);

  if (safeBrowsingResults.matches) {
    for await (const item of safeBrowsingResults.matches) {
      const { url } = item.threat;
      const updateResults = await supabase
        .from(SUPABASE_DB_TABLE)
        .update([
          {
            suspicious: true,
            safe_browsing_data: item,
          },
        ])
        .match({ original_url: url })
        .select();

      console.log(updateResults);
    }
  }

  const debugEnd = hrtime(debugStart);

  console.log(
    `Execution time: ${debugEnd[0] * 1000 + debugEnd[1] / 1000000}ms`
  );
}
