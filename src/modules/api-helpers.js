import Bugsnag from '@bugsnag/js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const {
  NODE_ENV,
  SUPABASE_URL,
  SUPABASE_ANON_PUB_KEY,
  SUPABASE_DB_TABLE,
  GOOGLE_SAFE_BROWSING_API_KEY,
  npm_package_version: appVersion,
} = process.env;

export const handleError = (error) => {
  console.error(error);

  if (NODE_ENV === 'production') {
    Bugsnag.notify(error);
  }
};

export const initSupabase = async () => {
  const supabase = await createClient(SUPABASE_URL, SUPABASE_ANON_PUB_KEY);

  return supabase;
};

export const shortenURL = async (
  url,
  clientInfo = {},
  safeBrowsingData = {}
) => {
  const supabase = await initSupabase();

  let shortId;

  const { data, error } = await supabase
    .from(SUPABASE_DB_TABLE)
    .select('short_id, original_url, visits, submissions, visits')
    .eq('original_url', url);

  let queryResults = null;

  if (data[0]?.short_id) {
    const submissionsCount = data[0].submissions + 1;

    shortId = data[0].short_id;
    queryResults = await supabase
      .from(SUPABASE_DB_TABLE)
      .update([
        {
          submissions: submissionsCount,
          suspicious: Boolean(Object.keys(safeBrowsingData).length),
          safe_browsing_data: safeBrowsingData,
          client_info: clientInfo,
        },
      ])
      .match({ short_id: shortId })
      .select();
    // console.log(queryResults);
  } else {
    shortId = nanoid(7);
    queryResults = await supabase
      .from(SUPABASE_DB_TABLE)
      .insert([
        {
          short_id: shortId,
          original_url: url,
          suspicious: Boolean(Object.keys(safeBrowsingData).length),
          safe_browsing_data: safeBrowsingData,
          client_info: clientInfo,
        },
      ])
      .select();
    // console.log(queryResults);
  }

  const [toReturn] = queryResults.data;

  return toReturn;
};

export const checkIfShortIdExists = async (supabase, shortId) => {
  const { data } = await supabase
    .from(SUPABASE_DB_TABLE)
    .select(
      'short_id, original_url, submissions, visits, suspicious, safe_browsing_data'
    )
    .eq('short_id', shortId);

  let returnData = data;

  // biome-ignore lint/complexity/useOptionalChain: <explanation>
  if (data && data[0]) {
    [returnData] = data;
  }

  return returnData;
};

export const getSafeBrowsingResults = async (url) => {
  let returnData;

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
      threatEntries: [{ url }],
    },
  };

  const safeBrowsingResults = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    }
  )
    .then(async (response) => await response.json())
    .then((data) => {
      returnData = data;
    });

  return safeBrowsingResults;
};
