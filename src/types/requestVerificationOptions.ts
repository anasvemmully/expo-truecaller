import type { TruecallerOAuthScope } from './oauthScopes';

/**
 * Consent screen color theme. Defaults to `'light'` if omitted - matches
 * TrueSDK's own default.
 *
 * @platform android
 */
export type TruecallerConsentTheme = 'light' | 'dark';

export type TruecallerConsentLanguage =
  | 'en' // English
  | 'hi' // Hindi
  | 'mr' // Marathi
  | 'te' // Telugu
  | 'ml' // Malayalam
  | 'ur' // Urdu
  | 'pa' // Punjabi
  | 'ta' // Tamil
  | 'bn' // Bengali
  | 'kn' // Kannada
  | 'sw' // Swahili
  | 'ar'; // Arabic

export type TruecallerRequestVerificationOptions = {
  /**
   * OAuth scopes to request for this verification.
   *
   * @platform android
   * @default 'profile', 'phone'
   */
  scopes?: TruecallerOAuthScope[];

  /**
   * Consent screen color theme for this verification.
   *
   * @platform android
   */
  theme?: TruecallerConsentTheme;

  /**
   * Consent screen language for this verification.
   */
  language?: TruecallerConsentLanguage;
};
