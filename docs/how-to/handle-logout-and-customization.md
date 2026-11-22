---
title: Handle logout and customize the consent screen
---

# Handle logout and customize the consent screen

## Log out

Call `clearCredentials()` when the user logs out of your app. It clears Truecaller SDK session state and resets `result`.

```tsx
const { clearCredentials } = useTruecaller();
await clearCredentials();
```

## Customize the consent screen (Android)

Pass {@link src!TruecallerCustomizationOptions} to the hook. They are applied once, on the mount-time `initialize()` call, and ignored on iOS.

```tsx
useTruecaller({ customization: { theme: 'dark' } });
```

To call `initialize()` yourself at another time, set `skipAutoInitialize: true` and make sure your own call runs before anything else.
