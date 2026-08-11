import { NativeModule, requireNativeModule } from 'expo';

import {
  ExpoTruecallerModuleEvents,
  TruecallerCustomizationOptions,
  TruecallerRequestVerificationOptions,
} from './types';

declare class ExpoTruecallerModule extends NativeModule<ExpoTruecallerModuleEvents> {
  initialize(options?: TruecallerCustomizationOptions): Promise<void>;
  isTruecallerUsable(): Promise<boolean>;
  requestVerification(options?: TruecallerRequestVerificationOptions): Promise<void>;
  clearCredentials(): Promise<void>;
}

export default requireNativeModule<ExpoTruecallerModule>('ExpoTruecaller');
