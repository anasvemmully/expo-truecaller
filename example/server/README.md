# expo-truecaller example server

Minimal Go backend demonstrating "Option B" — the app sends the
`authorizationCode` + `codeVerifier` it gets from `requestVerification()` here,
this server exchanges them with Truecaller for a token and decodes the
profile claims, and only ever returns that profile to the app. Truecaller's
raw tokens never reach the client.

Standard library only, no dependencies.

## Setup

```sh
cp .env.example .env
```

Fill in `.env`:

- `TRUECALLER_TOKEN_URL` — defaults to
  `https://oauth-account-noneu.truecaller.com/v1/token` if unset. This isn't
  from Truecaller's official docs (they don't publish it) - it's empirically
  verified: POSTing a form-encoded `authorization_code` grant to it returns a
  correctly-shaped OAuth2 error
  (`{"error":"invalid_grant","error_description":"Invalid authorization code"}`),
  and it does **not** require a `client_secret` alongside PKCE. Override this
  if Truecaller ever changes it.
- `TRUECALLER_CLIENT_ID` — same client ID used in `app.config.ts`'s
  `expo-truecaller` plugin config. Required - the endpoint above rejects
  requests with an empty `client_id`.

## Run

```sh
go run .
```

## Endpoint

`POST /auth/truecaller/exchange`

Request body:

```json
{
  "authorizationCode": "...",
  "codeVerifier": "..."
}
```

Response:

```json
{
  "profile": { "sub": "...", "phone_number": "...", "name": "...", "..." : "..." }
}
```

The exact profile fields depend on what Truecaller's `id_token` actually
contains for the scopes you requested (`openid`, `phone`, `profile`, ...).

## Not production-ready as-is

- **JWT signature verification is not implemented.** `decodeIDTokenClaims` in
  `service/truecaller.go` decodes the `id_token`'s payload directly without
  checking its signature. Before shipping this pattern for real, fetch
  Truecaller's JWKS and verify the signature (plus `iss`/`aud`/`exp` claims) —
  otherwise anything claiming to be a token would be accepted.
- **No user/session creation.** This demo just returns the decoded profile
  claims directly. A real backend would create or look up a user record here
  and return its own session token instead, so the app never sees Truecaller's
  tokens or raw profile claims directly.
