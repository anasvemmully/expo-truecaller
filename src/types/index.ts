import type { TruecallerErrorCode } from './errorCodes';

export * from './errorCodes';
export * from './customizationOptions';
export * from './oauthScopes';
export * from './requestVerificationOptions';

export type TruecallerUserProfile = {
  firstName: string | null;
  lastName?: string | null;
  phoneNumber: string | null;
  email?: string | null;
  gender?: 'male' | 'female' | null;
  city?: string | null;
  jobTitle?: string;
  avatarUrl?: string | null;
  isAmbassador?: boolean;
  countryCode: string | null;
  facebookId?: string;
  twitterId?: string;

  /**
   * Whether Truecaller considers this profile verified.
   *
   * @platform ios
   */
  isVerified?: boolean;

  /**
   * Raw material for independently verifying this profile's authenticity
   * server-side, instead of just trusting the SDK's own on-device checks -
   * mirrors why Android hands back `authorizationCode`/`codeVerifier`
   * rather than a trusted profile directly.
   *
   * To verify: fetch Truecaller's public keys from
   * `https://api4.truecaller.com/v1/key` (cacheable - only refetch if
   * verification fails against the cached set), then check `signature`
   * against `payload` using `signatureAlgorithm` and one of those keys.
   *
   * May be absent even on a genuine success - `didReceiveTrueProfileResponse:`
   * is an `@optional` SDK delegate method with no firing guarantee.
   *
   * @platform ios
   */
  verification?: {
    payload?: string | null;
    signature?: string | null;
    signatureAlgorithm?: string | null;
  };
};

export type TruecallerVerificationResult =
  | {
      status: 'success';

      platform: 'android';

      /**
       * A one-time-use OAuth authorization code. Exchange this (with
       * `codeVerifier`, PKCE-style) at Truecaller's token endpoint from your
       * own backend to get an access token - this module deliberately does
       * not perform that exchange itself, so no partner secret ever needs
       * to be embedded in the app. See the example app's `server/` for a
       * reference backend implementation.
       */
      authorizationCode: string;

      /**
       * The PKCE code verifier generated for this verification attempt.
       * Send it alongside `authorizationCode` to your backend's token
       * exchange - see the example app's `server/` for a reference
       * implementation.
       */
      codeVerifier: string;

      scopesGranted: string[];

      /**
       * Whether the verified phone number is on an active SIM in this
       * device right now: `1` confirmed present, `0` no active SIM at all,
       * `-1` inconclusive (OS/carrier restrictions, or a different SIM/eSIM
       * is active).
       */
      simState: number;

      /**
       * Identifier tying this verification to a specific device, if available.
       */
      deviceCode?: string;
    }
  | {
      status: 'success';

      platform: 'ios';

      /**
       * The verified user's Truecaller profile, returned directly - no backend exchange needed.
       */
      profile: TruecallerUserProfile;
    }
  | {
      status: 'failure';

      error: TruecallerErrorCode;

      /**
       * The raw, human-readable message behind `error`, when available.
       */
      errorMessage?: string;
    }
  | {
      status: 'dismissed';

      /**
       * Why the one-tap flow isn't usable for this user (e.g. they're not
       * a Truecaller user) - fall back to your app's other verification
       * method.
       *
       * @platform android
       */
      errorMessage?: string;
    };

export type ExpoTruecallerModuleEvents = {
  onVerificationResult: (result: TruecallerVerificationResult) => void;
};
