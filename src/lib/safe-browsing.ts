import crypto from 'node:crypto';

import { getDomain } from 'tldts';

// Google Safe Browsing v5 — No Storage Real-Time Mode
// https://developers.google.com/safe-browsing/reference/No.Storage.Real.Time.Mode

const HASHES_SEARCH_URL =
  'https://safebrowsing.googleapis.com/v5/hashes:search';
const MAX_PREFIXES_PER_REQUEST = 30;
const REQUEST_CONCURRENCY = 5;
const MAX_EXPRESSIONS_PER_URL = 30;

export type FullHashDetail = {
  threatType: string;
  attributes?: string[];
};

type FullHash = {
  fullHash: string;
  fullHashDetails: FullHashDetail[];
};

export type SafeBrowsingMatch = {
  matchedExpression: string;
  detail: FullHashDetail;
};

export type CheckOptions = {
  apiKey: string;
  userAgent: string;
};

// Canonicalize a URL per
// https://developers.google.com/safe-browsing/reference/URLs.and.Hashing
// Returns `host + path + query` (lowercased host, normalized path, escaped
// bytes). Returns null for non-http(s) or unparseable URLs.
export const canonicalizeUrl = (rawUrl: string): string | null => {
  const stripped = rawUrl.replace(/[\t\r\n]/g, '').split('#')[0];

  let parsed: URL;
  try {
    parsed = new URL(stripped);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const host = parsed.hostname
    .toLowerCase()
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');

  let pathname = percentDecodeLoop(parsed.pathname || '/');
  pathname = resolveDotSegments(pathname).replace(/\/{2,}/g, '/');
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  const search = parsed.search ? percentDecodeLoop(parsed.search) : '';

  return `${host}${escapeBytes(pathname)}${escapeBytes(search)}`;
};

const percentDecodeLoop = (input: string): string => {
  let current = input;
  for (let i = 0; i < 8; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) {
        return next;
      }
      current = next;
    } catch {
      return current;
    }
  }
  return current;
};

const resolveDotSegments = (path: string): string => {
  const out: string[] = [];
  for (const seg of path.split('/')) {
    if (seg === '.') {
      continue;
    }
    if (seg === '..') {
      if (out.length > 1) {
        out.pop();
      }
      continue;
    }
    out.push(seg);
  }
  return out.join('/') || '/';
};

const escapeBytes = (input: string): string => {
  let out = '';
  for (const byte of Buffer.from(input, 'utf8')) {
    if (byte <= 0x20 || byte >= 0x7f || byte === 0x23 || byte === 0x25) {
      out += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
    } else {
      out += String.fromCharCode(byte);
    }
  }
  return out;
};

// Up to 30 host-suffix / path-prefix expressions for a canonicalized URL.
export const generateExpressions = (canonicalUrl: string): string[] => {
  const slashIdx = canonicalUrl.indexOf('/');
  if (slashIdx === -1) {
    return [];
  }
  const host = canonicalUrl.slice(0, slashIdx);
  const pathAndQuery = canonicalUrl.slice(slashIdx);

  const expressions: string[] = [];
  const seen = new Set<string>();
  for (const h of hostVariants(host)) {
    for (const p of pathVariants(pathAndQuery)) {
      const expr = `${h}${p}`;
      if (!seen.has(expr)) {
        seen.add(expr);
        expressions.push(expr);
        if (expressions.length >= MAX_EXPRESSIONS_PER_URL) {
          return expressions;
        }
      }
    }
  }
  return expressions;
};

const hostVariants = (host: string): string[] => {
  // IPv4 / IPv6 literals: only the exact host.
  if (host.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return [host];
  }

  const registrable = getDomain(host) ?? host;
  const variants = [registrable];

  if (host !== registrable && host.endsWith(`.${registrable}`)) {
    const labels = host.slice(0, -registrable.length - 1).split('.');
    for (let i = labels.length - 1; i >= 0 && variants.length < 4; i -= 1) {
      const v = `${labels.slice(i).join('.')}.${registrable}`;
      if (!variants.includes(v)) {
        variants.push(v);
      }
    }
    if (!variants.includes(host)) {
      variants.push(host);
    }
  }
  return variants.slice(0, 5);
};

const pathVariants = (pathAndQuery: string): string[] => {
  const queryIdx = pathAndQuery.indexOf('?');
  const path = queryIdx === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIdx);
  const variants: string[] = [];
  const push = (p: string) => {
    if (!variants.includes(p) && variants.length < 6) {
      variants.push(p);
    }
  };

  if (queryIdx !== -1) {
    push(pathAndQuery);
  }
  push(path);
  push('/');
  const labels = path.split('/').filter(Boolean);
  for (let i = 1; i <= Math.min(labels.length - 1, 3); i += 1) {
    push(`/${labels.slice(0, i).join('/')}/`);
  }
  return variants;
};

const sha256 = (input: string): Buffer =>
  crypto.createHash('sha256').update(input, 'utf8').digest();

// The v5 hashes:search endpoint only returns application/x-protobuf. We decode
// the small subset of the schema we need:
//   HashesSearchResponse { repeated FullHash full_hashes = 1; Duration cache_duration = 2; }
//   FullHash             { bytes full_hash = 1; repeated FullHashDetail full_hash_details = 2; }
//   FullHashDetail       { ThreatType threat_type = 1; repeated ThreatAttribute attributes = 2; }

const THREAT_TYPE: Record<number, string> = {
  1: 'MALWARE',
  2: 'SOCIAL_ENGINEERING',
  3: 'UNWANTED_SOFTWARE',
  4: 'POTENTIALLY_HARMFUL_APPLICATION',
};

const THREAT_ATTRIBUTE: Record<number, string> = {
  1: 'CANARY',
  2: 'FRAME_ONLY',
};

type Cursor = { buf: Buffer; pos: number; end: number };

const readVarint = (c: Cursor): number => {
  let result = 0;
  let shift = 0;
  for (;;) {
    const byte = c.buf[c.pos];
    c.pos += 1;
    result = (result | ((byte & 0x7f) << shift)) >>> 0;
    if ((byte & 0x80) === 0) {
      return result;
    }
    shift += 7;
  }
};

const skipField = (c: Cursor, wire: number): void => {
  if (wire === 0) {
    readVarint(c);
  } else if (wire === 2) {
    c.pos += readVarint(c);
  } else if (wire === 1) {
    c.pos += 8;
  } else if (wire === 5) {
    c.pos += 4;
  } else {
    throw new Error(`unsupported protobuf wire type: ${wire}`);
  }
};

const decodeFullHashDetail = (c: Cursor): FullHashDetail | null => {
  let threatType: string | null = null;
  const attributes: string[] = [];
  while (c.pos < c.end) {
    const tag = readVarint(c);
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 0) {
      threatType = THREAT_TYPE[readVarint(c)] ?? null;
    } else if (field === 2 && wire === 0) {
      const name = THREAT_ATTRIBUTE[readVarint(c)];
      if (name) {
        attributes.push(name);
      }
    } else {
      skipField(c, wire);
    }
  }
  return threatType ? { threatType, attributes } : null;
};

const decodeFullHash = (c: Cursor): FullHash => {
  let fullHash = '';
  const fullHashDetails: FullHashDetail[] = [];
  while (c.pos < c.end) {
    const tag = readVarint(c);
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const len = readVarint(c);
      fullHash = c.buf.subarray(c.pos, c.pos + len).toString('base64');
      c.pos += len;
    } else if (field === 2 && wire === 2) {
      const len = readVarint(c);
      const detail = decodeFullHashDetail({
        buf: c.buf,
        pos: c.pos,
        end: c.pos + len,
      });
      if (detail) {
        fullHashDetails.push(detail);
      }
      c.pos += len;
    } else {
      skipField(c, wire);
    }
  }
  return { fullHash, fullHashDetails };
};

const decodeHashesSearchResponse = (buf: Buffer): FullHash[] => {
  const c: Cursor = { buf, pos: 0, end: buf.length };
  const out: FullHash[] = [];
  while (c.pos < c.end) {
    const tag = readVarint(c);
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const len = readVarint(c);
      out.push(decodeFullHash({ buf: c.buf, pos: c.pos, end: c.pos + len }));
      c.pos += len;
    } else {
      skipField(c, wire);
    }
  }
  return out;
};

const searchHashesBatch = async (
  prefixesB64: string[],
  options: CheckOptions
): Promise<FullHash[]> => {
  const url = new URL(HASHES_SEARCH_URL);
  url.searchParams.set('key', options.apiKey);
  for (const prefix of prefixesB64) {
    url.searchParams.append('hashPrefixes', prefix);
  }

  // Per the No-Storage Real-Time Mode spec: on any error, treat as SAFE.
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': options.userAgent },
    });
    if (!response.ok) {
      console.error(
        `[safe-browsing] HTTP ${response.status} ${response.statusText}`
      );
      return [];
    }
    const buf = Buffer.from(await response.arrayBuffer());
    return decodeHashesSearchResponse(buf);
  } catch (err) {
    console.error('[safe-browsing] error', err);
    return [];
  }
};

// Check a batch of URLs against Safe Browsing v5. Returns a map keyed by the
// original URL for any URL that matched a known threat; URLs absent from the
// map are SAFE. For URLs with multiple matching expressions, the longest match
// is reported.
export const checkUrlsAgainstSafeBrowsing = async (
  urls: string[],
  options: CheckOptions
): Promise<Map<string, SafeBrowsingMatch>> => {
  const records: { url: string; expression: string; fullHash: string }[] = [];
  const prefixes = new Set<string>();

  for (const rawUrl of urls) {
    const canonical = canonicalizeUrl(rawUrl);
    if (!canonical) {
      continue;
    }
    for (const expression of generateExpressions(canonical)) {
      const hash = sha256(expression);
      records.push({
        url: rawUrl,
        expression,
        fullHash: hash.toString('base64'),
      });
      prefixes.add(hash.subarray(0, 4).toString('base64'));
    }
  }
  if (prefixes.size === 0) {
    return new Map();
  }

  const allPrefixes = [...prefixes];
  const batches: string[][] = [];
  for (let i = 0; i < allPrefixes.length; i += MAX_PREFIXES_PER_REQUEST) {
    batches.push(allPrefixes.slice(i, i + MAX_PREFIXES_PER_REQUEST));
  }

  const detailByHash = new Map<string, FullHashDetail>();
  for (let i = 0; i < batches.length; i += REQUEST_CONCURRENCY) {
    const groups = await Promise.all(
      batches
        .slice(i, i + REQUEST_CONCURRENCY)
        .map((batch) => searchHashesBatch(batch, options))
    );
    for (const fullHashes of groups) {
      for (const fh of fullHashes) {
        if (fh.fullHashDetails[0]) {
          detailByHash.set(fh.fullHash, fh.fullHashDetails[0]);
        }
      }
    }
  }
  if (detailByHash.size === 0) {
    return new Map();
  }

  const matches = new Map<string, SafeBrowsingMatch>();
  for (const record of records) {
    const detail = detailByHash.get(record.fullHash);
    if (!detail) {
      continue;
    }
    const existing = matches.get(record.url);
    if (
      !existing ||
      record.expression.length > existing.matchedExpression.length
    ) {
      matches.set(record.url, { matchedExpression: record.expression, detail });
    }
  }
  return matches;
};
