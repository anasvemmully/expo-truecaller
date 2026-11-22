---
title: Exchange the Android authorization code
---

# Exchange the Android authorization code

On Android a successful Verification gives you an Authorization Code and a Code Verifier, not a profile. Send both to your backend and exchange them there.

## In the app

```tsx
useTruecaller({
  onResult: async (result) => {
    if (result.status === 'success' && result.platform === 'android') {
      const res = await fetch('https://your-api.example.com/auth/truecaller/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizationCode: result.authorizationCode,
          codeVerifier: result.codeVerifier,
        }),
      });
      const { profile } = await res.json();
    }
  },
});
```

## On the backend

POST a form-encoded `authorization_code` grant to Truecaller's token endpoint with your client ID, the code, and the code verifier. A reference implementation in Go, including `id_token` verification, lives in [`example/server/`](https://github.com/anasvemmully/expo-truecaller/tree/main/example/server).

## Before production

- Verify the returned `id_token`: RS256 signature against Truecaller's JWKS, plus `iss`, `aud` and `exp`. The example server does this in `service/jwt.go`.
- Create your own session for the user instead of returning Truecaller's data to the app.
- Treat each Authorization Code as single-use.
