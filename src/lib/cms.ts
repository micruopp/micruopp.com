// Lean bundle types — only what the site needs
export interface CmsBundleAsset {
  fieldName: string;
  key: string;
  url: string | null;
}

export interface CmsBundleCollectionItem {
  id: string;
  versionId: string;
  updatedAt: string;
  content: Record<string, unknown>;
  assets: CmsBundleAsset[];
}

export interface CmsBundleCollection {
  name: string;
  items: CmsBundleCollectionItem[];
}

export interface CmsSiteBundle {
  contractVersion: string;
  generatedAt: string;
  collections: Record<string, CmsBundleCollection>;
}

async function fetchBundle(): Promise<CmsSiteBundle> {
  const url = process.env.BUNDLE_URL;
  if (!url) {
    throw new Error(
      'BUNDLE_URL is not set. ' +
      'Set it to the CMS export endpoint (e.g. http://localhost:3000/api/export).'
    );
  }

  const secret = process.env.BUNDLE_SECRET;
  const headers: HeadersInit = secret ? { Authorization: `Bearer ${secret}` } : {};

  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) {
    throw new Error(`Bundle fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<CmsSiteBundle>;
}

// Module-level singleton — bundle is fetched once per build process
let _bundle: CmsSiteBundle | null = null;
let _fetched = false;

/**
 * Returns the site bundle from the CMS, or null if unavailable.
 * Falls back gracefully so callers can use local markdown data instead.
 *
 * Set BUNDLE_URL to the export endpoint:
 *   Local dev:  http://localhost:3000/api/export
 *   Vercel:     the public Vercel Blob URL written by the CMS at publish time
 * Set BUNDLE_SECRET if the endpoint requires Bearer auth (local CMS).
 */
export async function getSiteBundle(): Promise<CmsSiteBundle | null> {
  if (_fetched) return _bundle;
  _fetched = true;
  try {
    _bundle = await fetchBundle();
  } catch (err) {
    console.warn(
      '[cms] Bundle unavailable, falling back to local data:',
      err instanceof Error ? err.message : err
    );
  }
  return _bundle;
}
