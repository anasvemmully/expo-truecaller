/**
 * All known error codes this module can report in a `{ status: 'failure' }`
 * result.
 *
 * The Android-specific codes are mapped from Truecaller's numeric
 * `TcOAuthError.errorCode` values, verified directly against the compiled
 * SDK's `TcOAuthError.*` subclasses (Truecaller's own prose documentation
 * for this table has been found to list incorrect numeric values, so treat
 * this mapping - not the docs - as ground truth). The `IOS_*` codes come
 * from TrueSDK's `TCError.code` on iOS, which has no equivalent on Android.
 *
 * Exported as a real object (not just a TS type) so you can reference actual
 * values at runtime, e.g. `if (error === TruecallerErrorCodes.NOT_INSTALLED)`.
 */
export const TruecallerErrorCodes = {
  /**
   * Truecaller app is not installed (or `isTruecallerUsable()` was false).
   */
  NOT_INSTALLED: 'NOT_INSTALLED',

  /**
   * A network-level failure occurred talking to Truecaller's servers.
   */
  NETWORK_ERROR: 'NETWORK_ERROR',

  /**
   * Truecaller's API rate-limited this request.
   */
  API_RATE_LIMITED: 'API_RATE_LIMITED',

  /**
   * An unexpected internal error in this module or the native SDK.
   */
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  /**
   * The device's OS version isn't supported (e.g. no SHA-256/Base64 for PKCE).
   */
  UNSUPPORTED_OS_VERSION: 'UNSUPPORTED_OS_VERSION',

  /**
   * User denied verification while the consent screen was still loading.
   *
   * @platform android
   */
  USER_DENIED_WHILE_LOADING: 'USER_DENIED_WHILE_LOADING',
  /**
   * The Truecaller app closed unexpectedly mid-flow.
   *
   * @platform android
   */
  TRUECALLER_CLOSED_UNEXPECTEDLY: 'TRUECALLER_CLOSED_UNEXPECTEDLY',
  /**
   * User pressed the footer button to decline (e.g. "Use another method").
   *
   * @platform android
   */
  USER_DENIED_FOOTER_BUTTON: 'USER_DENIED_FOOTER_BUTTON',

  /**
   * User dismissed/cancelled the consent screen directly.
   */
  USER_DISMISSED_CONSENT_SCREEN: 'USER_DISMISSED_CONSENT_SCREEN',

  /**
   * Conflicting Android activity request code - an integration bug, not
   * user-facing.
   *
   * @platform android
   */
  REQUEST_CODE_CONFLICT: 'REQUEST_CODE_CONFLICT',

  /**
   * The Truecaller user's account is in an invalid state.
   *
   * @platform android
   */
  INVALID_ACCOUNT_STATE: 'INVALID_ACCOUNT_STATE',

  /**
   * The configured client ID / partner info is invalid or missing.
   */
  INVALID_PARTNER_CONFIGURATION: 'INVALID_PARTNER_CONFIGURATION',

  /**
   * The installed Truecaller app's SDK (or OS) is too old to support this flow.
   */
  SDK_TOO_OLD: 'SDK_TOO_OLD',

  /**
   * Truecaller's consent activity could not be found/launched.
   *
   * @platform android
   */
  ACTIVITY_NOT_FOUND: 'ACTIVITY_NOT_FOUND',

  /**
   * `iosAppKey` wasn't found in Info.plist - config plugin misconfiguration.
   *
   * @platform ios
   */
  IOS_APP_KEY_MISSING: 'IOS_APP_KEY_MISSING',

  /**
   * `iosAppLink` wasn't found in Info.plist - config plugin misconfiguration.
   *
   * @platform ios
   */
  IOS_APP_LINK_MISSING: 'IOS_APP_LINK_MISSING',

  /**
   * The Truecaller app is installed but no user is signed in.
   *
   * @platform ios
   */
  IOS_USER_NOT_SIGNED_IN: 'IOS_USER_NOT_SIGNED_IN',

  /**
   * The Universal Link handoff back to this app failed - usually means
   * `TruecallerAppDelegateSubscriber` isn't registered, or the associated
   * domain the config plugin sets up doesn't match `iosAppLink`.
   * @platform ios
   */
  IOS_UNIVERSAL_LINK_FAILED: 'IOS_UNIVERSAL_LINK_FAILED',

  /**
   * The custom URL scheme fallback handoff failed - check the config
   * plugin generated a `truecallersdk-{appKey}` entry in `CFBundleURLTypes`.
   * @platform ios
   */
  IOS_URL_SCHEME_MISSING: 'IOS_URL_SCHEME_MISSING',

  /**
   * An error occurred that doesn't map to any of the above.
   */
  UNKNOWN: 'UNKNOWN',
} as const;

/** Union of all possible values in {@link TruecallerErrorCodes}. */
export type TruecallerErrorCode = (typeof TruecallerErrorCodes)[keyof typeof TruecallerErrorCodes];
