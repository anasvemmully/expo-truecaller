---
title: Why Android and iOS results differ
---

# Why Android and iOS results differ

The two Truecaller SDKs work differently, and this module surfaces that rather than hiding it.

|                   | Android                              | iOS                              |
| ----------------- | ------------------------------------ | -------------------------------- |
| On success        | `authorizationCode` + `codeVerifier` | `profile`                        |
| Server-side check | Required: the Exchange               | Optional: `profile.verification` |
| Manual dismissal  | `status: 'dismissed'`                | Not detectable                   |

## Why Android uses an exchange

Android's SDK follows OAuth with PKCE. The app receives a one-time code and the matching verifier, and only a backend call to Truecaller turns them into a profile. This module stops before that step on purpose (see [ADR 0002](../adr/0002-no-token-exchange-in-the-module.md)) so no secret lives in your app and your server decides whether to trust the user.

## Why iOS returns a profile

TrueSDK on iOS returns the profile on-device. Because trusting the device alone is weaker, the module also passes through the signed `verification` material so you can check it yourself.

## One API, branch on `platform`

Both successes share `status: 'success'`; narrow on `result.platform` to read the right fields. See {@link src!TruecallerVerificationResult}.
