import { NativeModule, requireNativeModule } from 'expo';

import {
  ExpoTruecallerModuleEvents,
  TruecallerCustomizationOptions,
  TruecallerRequestVerificationOptions,
} from './types';

export declare class ExpoTruecallerModule extends NativeModule<ExpoTruecallerModuleEvents> {
  /**
   * Initializes the Truecaller SDK with the given consent-screen
   * customization. Safe to skip - `isTruecallerUsable()` and
   * `requestVerification()` both implicitly call this with no
   * customization the first time either is used, if it hasn't been called
   * yet. Call it explicitly only if you want specific customization
   * ({@link TruecallerCustomizationOptions}) applied.
   */
  initialize(options?: TruecallerCustomizationOptions): Promise<void>;

  /**
   * Resolves `true` if the one-tap flow can actually be launched (e.g. the
   * Truecaller app is installed and usable) - resolves `false` rather than
   * rejecting when it can't.
   */
  isTruecallerUsable(): Promise<boolean>;

  /**
   * Launches the Truecaller one-tap verification flow. The returned promise
   * only resolves once the flow has been *launched* - the actual outcome
   * (success, failure, or dismissal) arrives asynchronously via the
   * `onVerificationResult` event, not via this promise.
   */
  requestVerification(options?: TruecallerRequestVerificationOptions): Promise<void>;

  /** Clears any Truecaller SDK session state - call this on logout. */
  clearCredentials(): Promise<void>;
}

export default requireNativeModule<ExpoTruecallerModule>('ExpoTruecaller');
