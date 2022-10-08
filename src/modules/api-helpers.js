/* eslint-disable no-unused-vars */
import Bugsnag from '@bugsnag/js';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

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

export const shortenURL = async (url, safeBrowsingData = {}) => {
  const supabase = await initSupabase();
  let toReturn;

  const { data, error } = await supabase
    .from(SUPABASE_DB_TABLE)
    .select('short_id, original_url, submissions')
    .eq('original_url', url);

  if (data && data[0] && data[0].short_id) {
    const submissionsCount = data[0].submissions + 1;

    const { data: returnData, error: returnError } = await supabase
      .from(SUPABASE_DB_TABLE)
      .update([
        {
          submissions: submissionsCount,
          suspicious: Boolean(Object.keys(safeBrowsingData).length),
          safe_browsing_data: safeBrowsingData,
        },
      ])
      .match({ short_id: data[0].short_id });

    [toReturn] = returnData;
  } else {
    const { data: returnData, error: returnError } = await supabase
      .from(SUPABASE_DB_TABLE)
      .insert([
        {
          short_id: nanoid(7),
          original_url: url,
          suspicious: Boolean(Object.keys(safeBrowsingData).length),
          safe_browsing_data: safeBrowsingData,
        },
      ]);

    [toReturn] = returnData;
  }

  return toReturn;
};

export const checkIfShortIdExists = async (supabase, shortId) => {
  const { data } = await supabase
    .from(SUPABASE_DB_TABLE)
    .select(
      'short_id, original_url, submissions, suspicious, safe_browsing_data',
    )
    .eq('short_id', shortId);

  let returnData = data;

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
  const safeBrowsingResults = await axios(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: postData,
    },
  ).then((response) => response.data);

  return safeBrowsingResults;
};
