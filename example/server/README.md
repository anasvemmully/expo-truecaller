# expo-truecaller example server

Minimal Go backend demonstrating "Option B" — the app sends the
`authorizationCode` + `codeVerifier` it gets from `requestVerification()` here,
this server exchanges them with Truecaller for a token and decodes the
profile claims, and only ever returns that profile to the app. Truecaller's
raw tokens never reach the client.

Standard library only, apart from `godotenv` for loading `.env`.

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
- `TRUECALLER_ISSUER` - defaults to `https://oauth-account-noneu.truecaller.com`. The `id_token`'s `iss` claim must match it.
- `TRUECALLER_JWKS_URL` - defaults to `<issuer>/.well-known/<client id>/jwks.json`, taken from Truecaller's OpenID discovery document.
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
  "profile": { "sub": "...", "phone_number": "...", "name": "...", "...": "..." }
}
```

The exact profile fields depend on what Truecaller's `id_token` actually
contains for the scopes you requested (`openid`, `phone`, `profile`, ...).

## id_token verification

`service/jwt.go` verifies the `id_token` before returning any claims: RS256 only (`none` and HMAC algorithms are rejected), signature checked against Truecaller's JWKS (cached, refetched once on an unknown `kid` to cover rotation), then `iss`, `aud` (must include your client ID), `exp` and `nbf` with 60 seconds of clock skew.

## Still not production-ready as-is

- **No user/session creation.** This demo returns the verified profile claims directly. A real backend would create or look up a user record here and return its own session token, so the app never sees Truecaller's tokens or raw claims.
- **Error details are returned to the client.** A real backend should log them and return a generic message.
