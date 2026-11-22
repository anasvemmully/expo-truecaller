---
title: Use the iOS profile
---

# Use the iOS profile

On iOS a successful Verification hands the verified {@link src!TruecallerUserProfile} straight to the app.

```tsx
useTruecaller({
  onResult: (result) => {
    if (result.status === 'success' && result.platform === 'ios') {
      const { phoneNumber, firstName } = result.profile;
    }
  },
});
```

## Verifying the profile on your server (recommended)

`profile.verification` may carry a `payload`, `signature` and `signatureAlgorithm`. To check the profile independently:

1. Send the three fields to your backend.
2. Fetch Truecaller's public keys from `https://api4.truecaller.com/v1/key` (cache them; refetch only if verification fails).
3. Check `signature` against `payload` using that algorithm and key.

`verification` can be absent even on a genuine success, so decide up front whether your app accepts unverified profiles.
