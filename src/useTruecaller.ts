import { useCallback, useEffect, useRef, useState } from 'react';

import ExpoTruecaller from './ExpoTruecallerModule';
import {
  TruecallerCustomizationOptions,
  TruecallerRequestVerificationOptions,
  TruecallerVerificationResult,
} from './types';

export type UseTruecallerOptions = {
  /**
   * Consent screen customization applied on the initial `initialize()` call
   * this hook makes on mount - see {@link TruecallerCustomizationOptions}
   * (Android only, ignored on iOS).
   */
  customization?: TruecallerCustomizationOptions;

  /**
   * Skip the automatic `initialize()` call this hook otherwise makes on
   * mount - e.g. if you want to call `ExpoTruecaller.initialize(options)`
   * yourself at a different time. Note that `isTruecallerUsable()` and
   * `requestVerification()` both implicitly initialize the SDK with no
   * customization if nothing has initialized it yet, so if you set this,
   * make sure your own `initialize(options)` call genuinely runs first.
   */
  skipAutoInitialize?: boolean;

  /**
   * Called directly from the underlying `onVerificationResult` event as
   * soon as a result arrives - the right place to react to a result (e.g.
   * exchange Android's `authorizationCode` with your backend), rather than
   * a `useEffect` watching the returned `result` value, which would be
   * reacting to a state change instead of the actual event.
   */
  onResult?: (result: TruecallerVerificationResult) => void;
};

export type UseTruecallerResult = {
  isCheckingAvailability: boolean;

  isTruecallerUsable: boolean;

  isVerifying: boolean;

  result: TruecallerVerificationResult | null;

  requestVerification: (options?: TruecallerRequestVerificationOptions) => Promise<void>;

  clearCredentials: () => Promise<void>;
};

export function useTruecaller(options?: UseTruecallerOptions): UseTruecallerResult {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [isTruecallerUsable, setIsTruecallerUsable] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<TruecallerVerificationResult | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let isMounted = true;

    const setup = optionsRef.current?.skipAutoInitialize
      ? Promise.resolve()
      : ExpoTruecaller.initialize(optionsRef.current?.customization).catch(() => {});

    setup.then(() =>
      ExpoTruecaller.isTruecallerUsable()
        .then((usable) => {
          if (isMounted) setIsTruecallerUsable(usable);
        })
        .finally(() => {
          if (isMounted) setIsCheckingAvailability(false);
        })
    );

    const subscription = ExpoTruecaller.addListener('onVerificationResult', (payload) => {
      if (!isMounted) return;
      setIsVerifying(false);
      setResult(payload);
      optionsRef.current?.onResult?.(payload);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const requestVerification = useCallback(
    async (verificationOptions?: TruecallerRequestVerificationOptions) => {
      setResult(null);
      setIsVerifying(true);
      try {
        await ExpoTruecaller.requestVerification(verificationOptions);
      } catch {
        setIsVerifying(false);
        setResult({ status: 'failure', error: 'UNKNOWN' });
      }
    },
    []
  );

  const clearCredentials = useCallback(async () => {
    await ExpoTruecaller.clearCredentials();
    setResult(null);
  }, []);

  return {
    isCheckingAvailability,
    isTruecallerUsable,
    isVerifying,
    result,
    requestVerification,
    clearCredentials,
  };
}
