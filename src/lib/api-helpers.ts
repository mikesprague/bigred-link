import Bugsnag from '@bugsnag/js';
import { connect } from '@tursodatabase/serverless';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

import { checkUrlsAgainstSafeBrowsing } from './safe-browsing.js';

dotenv.config();

const {
  NODE_ENV,
  TURSO_DB_TABLE,
  TURSO_AUTH_TOKEN,
  TURSO_DATABASE_URL,
  GOOGLE_SAFE_BROWSING_API_KEY,
  npm_package_version: appVersion,
} = process.env;

export const handleError = (error: Error) => {
  console.error(error);

  if (NODE_ENV === 'production') {
    // @ts-ignore
    Bugsnag.notify(error);
  }
};

export const initDatabase = () => {
  const conn = connect({
    url: TURSO_DATABASE_URL as string,
    authToken: TURSO_AUTH_TOKEN as string,
  });

  return conn;
};

export const shortenURL = async (
  url: string,
  clientInfo: Record<string, unknown> = {},
  safeBrowsingData: Record<string, unknown> = {}
) => {
  const dbConn = initDatabase();

  let shortId;

  const existingShortlinkStatement = await dbConn.prepare(
    `SELECT short_id, original_url, submissions, visits FROM "${TURSO_DB_TABLE}" WHERE original_url = ?`
  );
  const existingShortlinkResults = await existingShortlinkStatement.get([url]);

  let queryResults = null;

  if (existingShortlinkResults?.short_id) {
    const submissionsCount = Number(existingShortlinkResults.submissions) + 1;

    shortId = existingShortlinkResults.short_id;

    queryResults = await dbConn.prepare(
      `UPDATE "${TURSO_DB_TABLE}" SET submissions = ?, suspicious = ?, safe_browsing_data = ?, client_info = ?, updated_at = CURRENT_TIMESTAMP WHERE short_id = ? RETURNING short_id`
    );
    await queryResults.run([
      submissionsCount,
      Boolean(Object.keys(safeBrowsingData).length),
      JSON.stringify(safeBrowsingData),
      JSON.stringify(clientInfo),
      shortId,
    ]);
    queryResults = await dbConn.prepare(
      `SELECT short_id, original_url, submissions, visits, created_at, updated_at, suspicious, safe_browsing_data, client_info FROM "${TURSO_DB_TABLE}" WHERE short_id = ?`
    );
    queryResults = await queryResults.get([shortId]);
  } else {
    shortId = nanoid(7);
    queryResults = await dbConn.prepare(
      `INSERT INTO "${TURSO_DB_TABLE}" (short_id, original_url, suspicious, safe_browsing_data, client_info) VALUES (?, ?, ?, ?, ?) RETURNING short_id`
    );
    await queryResults.run([
      shortId,
      url,
      Boolean(Object.keys(safeBrowsingData).length),
      JSON.stringify(safeBrowsingData),
      JSON.stringify(clientInfo),
    ]);
    queryResults = await dbConn.prepare(
      `SELECT short_id, original_url, submissions, visits, created_at, updated_at, suspicious, safe_browsing_data, client_info FROM "${TURSO_DB_TABLE}" WHERE short_id = ?`
    );
    queryResults = await queryResults.get([shortId]);
  }

  return queryResults;
};

export const checkIfShortIdExists = async (
  dbConn: ReturnType<typeof initDatabase>,
  shortId: string
) => {
  const existingShortIdStatement = await dbConn.prepare(
    `SELECT short_id, original_url, submissions, visits, created_at, updated_at, suspicious, safe_browsing_data, client_info FROM "${TURSO_DB_TABLE}" WHERE short_id = ?`
  );
  const existingShortIdResults = await existingShortIdStatement.get([shortId]);

  return existingShortIdResults;
};

export const getAllShortLinks = async (
  dbConn: ReturnType<typeof initDatabase>
) => {
  const getAllShortLinksStatement = await dbConn.prepare(
    `
      SELECT short_id, original_url, submissions, visits, created_at, updated_at, suspicious, safe_browsing_data, client_info
      FROM "${TURSO_DB_TABLE}"
    `
  );
  const getAllShortLinksResults = await getAllShortLinksStatement.all();

  return getAllShortLinksResults;
};

export const getSafeBrowsingResults = async (url: string) => {
  if (!GOOGLE_SAFE_BROWSING_API_KEY) {
    return {};
  }

  try {
    const matches = await checkUrlsAgainstSafeBrowsing([url], {
      apiKey: GOOGLE_SAFE_BROWSING_API_KEY,
      userAgent: `bigred.link/${appVersion}`,
    });
    const match = matches.get(url);
    return match ?? {};
  } catch (error) {
    handleError(error as Error);
    return {};
  }
};
