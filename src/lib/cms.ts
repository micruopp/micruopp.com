import { list } from '@vercel/blob';
import cmsConfig from '../../cms.config.json';

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

type CmsConfigShape = {
  storage?: { provider: string; bundleKey: string };
};

async function fetchBundle(): Promise<CmsSiteBundle> {
  const bundleUrl = process.env.CMS_BUNDLE_URL;
  if (bundleUrl) {
    const res = await fetch(bundleUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`CMS bundle fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<CmsSiteBundle>;
  }

  const storageConfig = (cmsConfig as CmsConfigShape).storage;
  if (!storageConfig) {
    throw new Error(
      'CMS_BUNDLE_URL is not set and cms.config.json has no storage block. ' +
      'Set CMS_BUNDLE_URL to the local CMS export endpoint (e.g. http://localhost:3000/api/export).'
    );
  }

  if (storageConfig.provider === 'vercel') {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not set');

    const { blobs } = await list({ prefix: storageConfig.bundleKey, token });
    const entry = blobs.find(b => b.pathname === storageConfig.bundleKey);
    if (!entry) {
      throw new Error(
        `Site bundle not found in Vercel Blob at "${storageConfig.bundleKey}". ` +
        'Has the CMS published the site at least once?'
      );
    }

    // downloadUrl is a pre-authenticated URL returned by the Vercel Blob SDK
    const res = await fetch(entry.downloadUrl);
    if (!res.ok) {
      throw new Error(`Bundle download failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<CmsSiteBundle>;
  }

  throw new Error(
    `Storage provider "${storageConfig.provider}" is not supported by cms.ts. ` +
    'Only "vercel" is currently implemented.'
  );
}

// Module-level singleton — bundle is fetched once per build process
let _bundle: CmsSiteBundle | null = null;
let _fetched = false;

/**
 * Returns the site bundle from the CMS, or null if unavailable.
 * Falls back gracefully so callers can use local markdown data instead.
 *
 * Local dev: set CMS_BUNDLE_URL=http://localhost:3000/api/export
 * Production: set BLOB_READ_WRITE_TOKEN; bundle key is read from cms.config.json
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
