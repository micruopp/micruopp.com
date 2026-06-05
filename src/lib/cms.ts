import { getBundleAdapter } from './adapters/bundle';

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

export interface CmsBundlePage {
  slug: string;
  versionId: string;
  updatedAt: string;
  content: Record<string, unknown>;
  assets: CmsBundleAsset[];
}

export interface CmsSiteBundle {
  contractVersion: string;
  generatedAt: string;
  pages?: CmsBundlePage[];
  collections: Record<string, CmsBundleCollection>;
}

// Module-level singleton — bundle is fetched once per build process
let _bundle: CmsSiteBundle | null = null;
let _fetched = false;

/**
 * Returns the site bundle, or null if unavailable.
 * Falls back gracefully so callers can use local markdown data instead.
 *
 * Adapter is selected by BUNDLE_PROVIDER env var:
 *   http (default) — fetch(BUNDLE_URL) with optional Bearer BUNDLE_SECRET
 *   vercel         — @vercel/blob head(BUNDLE_BLOB_KEY) → signed downloadUrl
 */
export async function getSiteBundle(): Promise<CmsSiteBundle | null> {
  if (_fetched) return _bundle;
  _fetched = true;
  try {
    _bundle = await getBundleAdapter().fetchBundle();
  } catch (err) {
    console.warn(
      '[cms] Bundle unavailable, falling back to local data:',
      err instanceof Error ? err.message : err
    );
  }
  return _bundle;
}

export async function getCmsPage(slug: string): Promise<CmsBundlePage | null> {
  const bundle = await getSiteBundle();
  if (!bundle?.pages || bundle.pages.length === 0) {
    return null;
  }
  return bundle.pages.find((page) => page.slug === slug) ?? null;
}
