import type { BundleAdapter } from './contract';
import type { CmsSiteBundle } from '../../cms';

/**
 * Fetches the site bundle over HTTP with an optional Bearer token.
 * Use for local dev (CMS running at BUNDLE_URL) or any HTTP endpoint.
 *
 * Required env vars:
 *   BUNDLE_URL    - the CMS /api/export endpoint
 *   BUNDLE_SECRET - bearer token (optional; required if CMS has auth enabled)
 */
export function createHttpBundleAdapter(): BundleAdapter {
  return {
    async fetchBundle(): Promise<CmsSiteBundle> {
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
    },
  };
}
