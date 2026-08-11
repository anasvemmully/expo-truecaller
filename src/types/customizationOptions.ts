/**
 * Consent screen customization for {@link ExpoTruecallerModule.initialize},
 * passed at SDK-init time (matches Android's `TcSdkOptions.Builder` - iOS's
 * TrueSDK has no equivalent customization API, so these are ignored there).
 *
 * Since the SDK can only really be configured once, these only take effect
 * on whichever call actually performs initialization first. There's no
 * auto-init on startup, so `initialize(options)` is always that call - just
 * make sure you call it (and with the options you want) before
 * `isTruecallerUsable()` or `requestVerification()`, since either of those
 * will otherwise trigger initialization with no customization first.
 *
 * @platform android
 */
export type TruecallerCustomizationOptions = {
  /** Hex color string, e.g. `'#0087FF'`. */
  buttonColor?: string;
  /** Hex color string, e.g. `'#FFFFFF'`. */
  buttonTextColor?: string;
  loginTextPrefix?:
    | 'toGetStarted'
    | 'toContinue'
    | 'toPlaceOrder'
    | 'toCompleteYourPurchase'
    | 'toCheckout'
    | 'toCompleteYourBooking'
    | 'toProceedWithYourBooking'
    | 'toContinueWithYourBooking'
    | 'toGetDetails'
    | 'toViewMore'
    | 'toContinueReading'
    | 'toProceed'
    | 'forNewUpdates'
    | 'toGetUpdates'
    | 'toSubscribe'
    | 'toSubscribeAndGetUpdates';
  ctaText?: 'proceed' | 'continue' | 'accept' | 'confirm' | 'use' | 'continueWith' | 'proceedWith';
  buttonShape?: 'rounded' | 'rectangle';
  footerType?: 'skip' | 'anotherMobileNumber' | 'anotherMethod' | 'manually' | 'later';
  consentHeading?:
    | 'logInTo'
    | 'signUpWith'
    | 'signInTo'
    | 'verifyNumberWith'
    | 'registerWith'
    | 'getStartedWith'
    | 'proceedWith'
    | 'verifyWith'
    | 'verifyProfileWith'
    | 'verifyYourProfileWith'
    | 'verifyPhoneNoWith'
    | 'verifyYourNoWith'
    | 'continueWith'
    | 'completeOrderWith'
    | 'placeOrderWith'
    | 'completeBookingWith'
    | 'checkoutWith'
    | 'manageDetailsWith'
    | 'manageYourDetailsWith'
    | 'loginToWithOneTap'
    | 'subscribeTo'
    | 'getUpdatesFrom'
    | 'continueReadingOn'
    | 'getNewUpdatesFrom'
    | 'loginSignupWith';
  verifyMode?: 'onlyTruecallerUsers' | 'allUsers';
  dismissOption?: 'secondaryCtaBorder' | 'crossButton';
  consentMode?: 'popup' | 'bottomSheet';
  enhancedBottomSheet?: boolean;
};
