import { registerWebModule, NativeModule } from 'expo';

import {
  ExpoTruecallerModuleEvents,
  TruecallerCustomizationOptions,
  TruecallerRequestVerificationOptions,
} from './types';

class ExpoTruecallerModule extends NativeModule<ExpoTruecallerModuleEvents> {
  async initialize(_options?: TruecallerCustomizationOptions): Promise<void> {}

  async isTruecallerUsable(): Promise<boolean> {
    return false;
  }

  async requestVerification(_options?: TruecallerRequestVerificationOptions): Promise<void> {
    console.warn(
      'expo-truecaller: requestVerification() was called on web, where Truecaller has no ' +
        "SDK - check isTruecallerUsable() before calling this. Emitting a 'failure' result."
    );

    this.emit('onVerificationResult', {
      status: 'failure',
      error: 'UNSUPPORTED_OS_VERSION',
    });
  }

  async clearCredentials(): Promise<void> {}
}

export default registerWebModule(ExpoTruecallerModule, 'ExpoTruecallerModule');
