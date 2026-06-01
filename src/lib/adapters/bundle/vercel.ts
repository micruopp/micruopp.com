import type { BundleAdapter } from './contract';
import type { CmsSiteBundle } from '../../cms';

/**
 * Fetches the site bundle from a private Vercel Blob store using the SDK.
 * The SDK handles authentication via BLOB_READ_WRITE_TOKEN automatically.
 *
 * Required env vars:
 *   BLOB_READ_WRITE_TOKEN - auto-injected by Vercel when a blob store is linked
 *   BUNDLE_BLOB_KEY       - pathname of the bundle in the blob store
 *                           (e.g. "export/site-bundle.json")
 */
export function createVercelBundleAdapter(): BundleAdapter {
  return {
    async fetchBundle(): Promise<CmsSiteBundle> {
      const key = process.env.BUNDLE_BLOB_KEY;
      if (!key) {
        throw new Error('BUNDLE_BLOB_KEY is not set (e.g. "export/site-bundle.json").');
      }

      // Lazy import so the module is only loaded when this adapter is used
      const { head } = await import('@vercel/blob');

      // head() authenticates via BLOB_READ_WRITE_TOKEN and returns a signed downloadUrl
      const meta = await head(key);

      const res = await fetch(meta.downloadUrl, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Bundle download failed: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<CmsSiteBundle>;
    },
  };
}
