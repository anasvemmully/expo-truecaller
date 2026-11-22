import { act, renderHook, waitFor } from '@testing-library/react-native';

import ExpoTruecaller from '../ExpoTruecallerModule';
import { useTruecaller } from '../useTruecaller';

type Listener = (payload: unknown) => void;
let listener: Listener | undefined;

jest.mock('../ExpoTruecallerModule', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(() => Promise.resolve()),
    isTruecallerUsable: jest.fn(() => Promise.resolve(true)),
    requestVerification: jest.fn(() => Promise.resolve()),
    clearCredentials: jest.fn(() => Promise.resolve()),
    addListener: jest.fn((_event: string, cb: Listener) => {
      listener = cb;
      return { remove: jest.fn() };
    }),
  },
}));

const native = ExpoTruecaller as jest.Mocked<typeof ExpoTruecaller>;

beforeEach(() => {
  jest.clearAllMocks();
  listener = undefined;
});

describe('useTruecaller', () => {
  it('initializes and reports availability on mount', async () => {
    const { result } = await renderHook(() => useTruecaller({ customization: { theme: 'dark' } }));
    await waitFor(() => expect(result.current.isCheckingAvailability).toBe(false));
    expect(native.initialize).toHaveBeenCalledWith({ theme: 'dark' });
    expect(result.current.isTruecallerUsable).toBe(true);
  });

  it('skips initialize when skipAutoInitialize is set', async () => {
    const { result } = await renderHook(() => useTruecaller({ skipAutoInitialize: true }));
    await waitFor(() => expect(result.current.isCheckingAvailability).toBe(false));
    expect(native.initialize).not.toHaveBeenCalled();
  });

  it('delivers verification results to state and onResult', async () => {
    const onResult = jest.fn();
    const { result } = await renderHook(() => useTruecaller({ onResult }));
    await waitFor(() => expect(result.current.isCheckingAvailability).toBe(false));

    await act(async () => {
      await result.current.requestVerification();
    });
    expect(result.current.isVerifying).toBe(true);

    const payload = { status: 'failure', error: 'NETWORK_ERROR' };
    await act(async () => listener?.(payload));
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.result).toEqual(payload);
    expect(onResult).toHaveBeenCalledWith(payload);
  });

  it('maps a rejected launch to an UNKNOWN failure', async () => {
    native.requestVerification.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useTruecaller());
    await waitFor(() => expect(result.current.isCheckingAvailability).toBe(false));
    await act(async () => {
      await result.current.requestVerification();
    });
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.result).toEqual({ status: 'failure', error: 'UNKNOWN' });
  });

  it('clears the result on clearCredentials', async () => {
    const { result } = await renderHook(() => useTruecaller());
    await waitFor(() => expect(result.current.isCheckingAvailability).toBe(false));
    await act(async () => listener?.({ status: 'failure', error: 'NETWORK_ERROR' }));
    await act(async () => {
      await result.current.clearCredentials();
    });
    expect(native.clearCredentials).toHaveBeenCalled();
    expect(result.current.result).toBeNull();
  });
});
