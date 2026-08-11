/**
 * Each scope you request must also be enabled for your client ID on the
 * Truecaller developer portal, or the request will fail - `profile` and
 * `phone` are enabled by default for new projects.
 *
 * @platform android
 */
export type TruecallerOAuthScope =
  'profile' | 'phone' | 'openid' | 'offline_access' | 'email' | 'address';
