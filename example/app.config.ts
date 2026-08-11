import { ExpoConfig } from 'expo/config';

const truecallerClientId = process.env.TRUECALLER_CLIENT_ID;
const truecallerIosAppKey = process.env.TRUECALLER_APP_KEY;
const truecallerIosAppLink = process.env.TRUECALLER_APP_LINK;

const config: ExpoConfig = {
  name: 'expo-truecaller-example',
  slug: 'expo-truecaller-example',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.expotruecallerexample',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'com.anonymous.expotruecallerexample',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-truecaller',
      {
        androidClientId: truecallerClientId,
        iosAppKey: truecallerIosAppKey,
        iosAppLink: truecallerIosAppLink,
      },
    ],
  ],
};

export default config;
