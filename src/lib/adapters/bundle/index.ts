import type { BundleAdapter } from './contract';
import { createHttpBundleAdapter } from './http';
import { createVercelBundleAdapter } from './vercel';

export type { BundleAdapter };

/**
 * Returns the appropriate bundle adapter based on BUNDLE_PROVIDER env var.
 *
 *   BUNDLE_PROVIDER=vercel  → VercelBundleAdapter (private blob via SDK)
 *   BUNDLE_PROVIDER=http    → HttpBundleAdapter (Bearer-authed HTTP fetch)
 *   (unset)                 → HttpBundleAdapter (default; works for local dev)
 */
export function getBundleAdapter(): BundleAdapter {
  const provider = process.env.BUNDLE_PROVIDER ?? 'http';

  switch (provider) {
    case 'vercel':
      return createVercelBundleAdapter();
    case 'http':
      return createHttpBundleAdapter();
    default:
      throw new Error(
        `Unknown BUNDLE_PROVIDER "${provider}". Supported values: "vercel", "http".`
      );
  }
}
