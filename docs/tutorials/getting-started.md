---
title: Getting started
---

# Getting started

By the end of this tutorial you will have a button in your Expo app that launches Truecaller's one-tap flow and shows the result.

You need an Expo app on SDK 57 or 58, a development build (Expo Go cannot load native modules), and Truecaller credentials: an Android client ID, an iOS app key and app link, or both.

## 1. Install

```sh
npx expo install @anasvemmully/expo-truecaller
```

## 2. Configure the plugin

In `app.json`, add the plugin with your credentials:

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

Leave out a platform's options to skip it entirely. `iosAppKey` and `iosAppLink` must be given together. See {@link plugin/src!ExpoTruecallerPluginOptions}.

## 3. Rebuild the native app

```sh
npx expo prebuild
npx expo run:android   # or run:ios
```

## 4. Add the button

```tsx
import { Pressable, Text } from 'react-native';
import { useTruecaller } from '@anasvemmully/expo-truecaller';

export function VerifyButton() {
  const { isTruecallerUsable, isVerifying, result, requestVerification } = useTruecaller({
    onResult: (r) => console.log('Verification result', r),
  });

  if (!isTruecallerUsable) return null;

  return (
    <>
      <Pressable disabled={isVerifying} onPress={() => requestVerification()}>
        <Text>{isVerifying ? 'Verifying…' : 'Continue with Truecaller'}</Text>
      </Pressable>
      {result && <Text>{result.status}</Text>}
    </>
  );
}
```

Run the app on a device with the Truecaller app installed and tap the button. You should see the consent screen, then `success`.

## Next steps

- Android returned a code instead of a profile: [Exchange the Android authorization code](../how-to/exchange-android-code.md).
- On iOS: [Use the iOS profile](../how-to/use-ios-profile.md).
- Why the two platforms differ: [Android and iOS results](../explanation/android-vs-ios.md).
