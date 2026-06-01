import type { CmsSiteBundle } from '../../cms';

export interface BundleAdapter {
  /**
   * Fetch the current site bundle. Throws if unavailable.
   */
  fetchBundle(): Promise<CmsSiteBundle>;
}
