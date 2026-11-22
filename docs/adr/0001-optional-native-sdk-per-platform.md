# Truecaller native SDKs are bundled per platform, only when configured

The config plugin includes the Truecaller Android or iOS SDK in a build only when that platform's credentials are provided; otherwise a no-op "disabled" module is compiled instead. We chose this over always bundling both SDKs so apps that only target one platform (or don't use Truecaller on a build variant) pay no binary size, permission or review cost for the other.

## Consequences

- JS code always sees the same module API; on a disabled platform it reports not usable rather than throwing.
- Providing only one of `iosAppKey` / `iosAppLink` fails at prebuild, because a half-configured iOS build cannot work.
