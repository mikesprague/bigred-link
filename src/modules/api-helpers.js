import Bugsnag from '@bugsnag/js';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const { SUPABASE_URL, SUPABASE_ANON_PUB_KEY, SUPABASE_DB_TABLE } = process.env;

export const handleError = (error) => {
  console.error(error);
  Bugsnag.notify(error);
};

export const initSupabase = async () => {
  const supabase = await createClient(SUPABASE_URL, SUPABASE_ANON_PUB_KEY);

  return supabase;
};

export const shortenURL = async (url) => {
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
      .update({ submissions: submissionsCount })
      .match({ short_id: data[0].short_id });

    [toReturn] = returnData;
  } else {
    const { data: returnData, error: returnError } = await supabase
      .from(SUPABASE_DB_TABLE)
      .insert([
        {
          short_id: nanoid(7),
          original_url: url,
        },
      ]);

    [toReturn] = returnData;
  }

  return toReturn;
};

export const checkIfShortIdExists = async (supabase, shortId) => {
  const { data } = await supabase
    .from(SUPABASE_DB_TABLE)
    .select('short_id, original_url, submissions')
    .eq('short_id', shortId);

  return data[0];
};
