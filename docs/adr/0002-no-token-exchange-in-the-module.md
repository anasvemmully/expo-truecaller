# The module never performs the Android authorization-code exchange

On Android the module returns the Authorization Code and Code Verifier and leaves the Exchange to the app's own backend. Doing it inside the app would require shipping a partner secret in the binary or trusting an unverified on-device profile, so we accepted the cost of every Android consumer needing a small backend endpoint.

## Considered Options

- **Exchange in-app:** simpler for consumers, but exposes credentials and skips server-side verification.
- **Ship a hosted exchange service:** rejected, since it would put every consumer's users behind this project's infrastructure.
