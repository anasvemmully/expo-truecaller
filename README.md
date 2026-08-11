# @anasvemmully/expo-truecaller

Truecaller integration for Expo - one-tap phone verification for Android and iOS via an Expo native module, config plugin, and React hook.

[![npm version](https://img.shields.io/npm/v/@anasvemmully/expo-truecaller.svg)](https://www.npmjs.com/package/@anasvemmully/expo-truecaller)
[![npm downloads](https://img.shields.io/npm/dm/@anasvemmully/expo-truecaller.svg)](https://www.npmjs.com/package/@anasvemmully/expo-truecaller)
[![CI](https://github.com/anasvemmully/expo-truecaller/actions/workflows/ci.yml/badge.svg)](https://github.com/anasvemmully/expo-truecaller/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@anasvemmully/expo-truecaller.svg)](./LICENSE)

## Install

```sh
npx expo install @anasvemmully/expo-truecaller
```

Register the config plugin in `app.json` (either platform can be omitted - an unconfigured platform's native SDK isn't bundled into the build at all):

```json
{
  "plugins": [
    [
      "@anasvemmully/expo-truecaller",
      {
        "androidClientId": "<android-client-id>",
        "iosAppKey": "<ios-app-key>",
        "iosAppLink": "<ios-app-link>"
      }
    ]
  ]
}
```

`iosAppKey` and `iosAppLink` must be provided together - giving only one throws at prebuild time. Then run `npx expo prebuild`.

## Quick Start

```tsx
import { useTruecaller } from '@anasvemmully/expo-truecaller';

function VerifyButton() {
  const { isTruecallerUsable, isVerifying, requestVerification } = useTruecaller({
    onResult: (result) => {
      if (result.status === 'success' && result.platform === 'android') {
        // Exchange result.authorizationCode + result.codeVerifier at your
        // backend's token endpoint - see example/server/ for a reference
        // implementation.
      } else if (result.status === 'success' && result.platform === 'ios') {
        // result.profile is the verified Truecaller profile, no backend
        // exchange needed.
      }
    },
  });

  if (!isTruecallerUsable) return null;

  return (
    <Pressable disabled={isVerifying} onPress={() => requestVerification()}>
      <Text>{isVerifying ? 'Verifying…' : 'Continue with Truecaller'}</Text>
    </Pressable>
  );
}
```

## Platform differences

| | Android | iOS |
| --- | --- | --- |
| On success | `authorizationCode` + `codeVerifier` - exchange these at your backend | `profile` - the verified Truecaller profile, handed back directly |
| Server-side verification | Required (PKCE code exchange) | Optional (`profile.verification` payload/signature, if present) |
| Manual dismissal | Reported via `status: 'dismissed'` | Not detectable - see [`TruecallerVerificationResult`](https://anasvemmully.github.io/expo-truecaller/) docs |

## Documentation

- 📖 [Full API reference](https://anasvemmully.github.io/expo-truecaller/) - generated from the TypeScript source, including all module methods, hook options, and config plugin options.
- [`example/`](https://github.com/anasvemmully/expo-truecaller/tree/main/example) - a full Expo app using `useTruecaller()`.
- [`example/server/`](https://github.com/anasvemmully/expo-truecaller/tree/main/example/server) - a reference Go backend performing the Android OAuth code exchange.

## Contributing

```sh
npm ci
npm run build
npm run lint
```

To run the example app: `cd example`, then `npm run open:ios` / `npm run open:android` from the repo root, or `npx expo start` inside `example/`.

## License

MIT - see [LICENSE](./LICENSE).
