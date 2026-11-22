# expo-truecaller

Truecaller one-tap phone verification for Expo apps: the vocabulary shared by the module, its config plugin and the docs.

## Language

**One-tap flow**:
The Truecaller-driven screen where a user confirms their phone number in a single tap instead of typing an SMS code.
_Avoid_: Truecaller login, Truecaller sign-in

**Verification**:
One attempt at the one-tap flow, from launch until a Verification Result arrives.
_Avoid_: Login, authentication, sign-in

**Verification Result**:
The outcome of a Verification: `success`, `failure` or `dismissed`. Delivered asynchronously, never through the launching call's promise.
_Avoid_: Response, callback payload

**Truecaller-usable**:
Whether the one-tap flow can be launched on this device right now (for example, the Truecaller app is installed).
_Avoid_: Truecaller available, supported

**Dismissed**:
A Verification Result meaning the user will not or cannot use the one-tap flow; the app should fall back to another verification method.
_Avoid_: Cancelled, aborted

## Android credentials

**Authorization Code**:
A single-use code from a successful Android Verification, exchanged by the app's backend for the user's profile.
_Avoid_: Auth token, access token

**Code Verifier**:
The secret generated per Verification and sent to the backend together with the Authorization Code to complete the exchange.
_Avoid_: PKCE secret

**Exchange**:
The backend call to Truecaller that turns an Authorization Code and Code Verifier into the user's verified profile.
_Avoid_: Login call, token call

## iOS credentials

**Profile**:
The verified Truecaller user details handed back directly to the app on a successful iOS Verification.
_Avoid_: User, account

**Verification Payload**:
The signed material attached to an iOS Profile so a backend can independently check it is genuine.
_Avoid_: Token, proof

## Setup

**Platform enablement**:
A platform is enabled only when its credentials are given to the config plugin; an unconfigured platform ships without the Truecaller SDK at all.
_Avoid_: Platform toggle, feature flag

**Consent customization**:
Appearance and wording options for the Truecaller consent screen. Android only.
_Avoid_: Theming, branding
