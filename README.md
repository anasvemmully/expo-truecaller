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

|                          | Android                                                               | iOS                                                                                                         |
| ------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| On success               | `authorizationCode` + `codeVerifier` - exchange these at your backend | `profile` - the verified Truecaller profile, handed back directly                                           |
| Server-side verification | Required (PKCE code exchange)                                         | Optional (`profile.verification` payload/signature, if present)                                             |
| Manual dismissal         | Reported via `status: 'dismissed'`                                    | Not detectable - see [`TruecallerVerificationResult`](https://anasvemmully.github.io/expo-truecaller/) docs |

## Documentation

Full docs: **https://anasvemmully.github.io/expo-truecaller/**

- **Tutorial:** [Getting started](./docs/tutorials/getting-started.md)
- **How-to:** [Exchange the Android code](./docs/how-to/exchange-android-code.md) · [Use the iOS profile](./docs/how-to/use-ios-profile.md) · [Logout and customization](./docs/how-to/handle-logout-and-customization.md)
- **Explanation:** [Why Android and iOS differ](./docs/explanation/android-vs-ios.md)
- **Reference:** the generated API docs on the site above
- [GLOSSARY.md](./GLOSSARY.md) · [Architecture decisions](https://github.com/anasvemmully/expo-truecaller/tree/main/docs/adr) · [CHANGELOG](./CHANGELOG.md)
- [`example/`](https://github.com/anasvemmully/expo-truecaller/tree/main/example) - a full Expo app; [`example/server/`](https://github.com/anasvemmully/expo-truecaller/tree/main/example/server) - a reference Go backend for the Android exchange.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT - see [LICENSE](./LICENSE).
