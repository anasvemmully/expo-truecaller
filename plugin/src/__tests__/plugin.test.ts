import type { ExpoConfig } from '@expo/config-types';

import withExpoTruecaller from '../index';

type Mod = (config: any) => Promise<any>;

const baseConfig = (): ExpoConfig => ({ name: 'app', slug: 'app' });

function apply(options?: Record<string, unknown>): ExpoConfig {
  return (withExpoTruecaller as any)(baseConfig(), options) as ExpoConfig;
}

async function runMod(
  config: ExpoConfig,
  platform: 'ios' | 'android',
  mod: string,
  modResults: any
) {
  const fn = (config.mods as any)?.[platform]?.[mod] as Mod | undefined;
  if (!fn) throw new Error(`no ${platform}.${mod} mod registered`);
  const result = await fn({ ...config, modRequest: {}, modResults });
  return result.modResults;
}

const ANDROID = { androidClientId: 'android-id' };
const IOS = { iosAppKey: 'ios-key', iosAppLink: 'https://truecaller.example.com/abc' };

describe('option validation', () => {
  it('rejects unknown options', () => {
    expect(() => apply({ buttonColor: 'red' })).toThrow(/unknown plugin option "buttonColor"/);
  });

  it('requires iosAppLink with iosAppKey', () => {
    expect(() => apply({ iosAppKey: 'k' })).toThrow(/"iosAppLink" is required/);
  });

  it('requires iosAppKey with iosAppLink', () => {
    expect(() => apply({ iosAppLink: 'https://x.example.com' })).toThrow(/"iosAppKey" is required/);
  });

  it('accepts no options', () => {
    expect(() => apply()).not.toThrow();
  });
});

describe('platform enablement flags', () => {
  it('disables both platforms when unconfigured', async () => {
    const config = apply();
    const props = await runMod(config, 'android', 'gradleProperties', []);
    expect(props).toContainEqual({
      type: 'property',
      key: 'expoTruecallerAndroidEnabled',
      value: 'false',
    });
    const podfile = await runMod(config, 'ios', 'podfile', { contents: 'target "App" do\nend\n' });
    expect(podfile.contents).toContain("ENV['EXPO_TRUECALLER_IOS_ENABLED'] = 'false'");
    expect(config.mods?.ios?.infoPlist).toBeUndefined();
    expect(config.mods?.android?.manifest).toBeUndefined();
  });

  it('enables Android only when androidClientId is set', async () => {
    const config = apply(ANDROID);
    const props = await runMod(config, 'android', 'gradleProperties', []);
    expect(props).toContainEqual({
      type: 'property',
      key: 'expoTruecallerAndroidEnabled',
      value: 'true',
    });
    expect(config.mods?.ios?.infoPlist).toBeUndefined();
  });

  it('replaces an existing gradle property instead of duplicating it', async () => {
    const config = apply(ANDROID);
    const props = await runMod(config, 'android', 'gradleProperties', [
      { type: 'property', key: 'expoTruecallerAndroidEnabled', value: 'false' },
    ]);
    expect(props.filter((p: any) => p.key === 'expoTruecallerAndroidEnabled')).toEqual([
      { type: 'property', key: 'expoTruecallerAndroidEnabled', value: 'true' },
    ]);
  });
});

describe('Android setup', () => {
  it('writes the client ID string', async () => {
    const strings = await runMod(apply(ANDROID), 'android', 'strings', { resources: {} });
    expect(JSON.stringify(strings)).toContain('android-id');
    expect(JSON.stringify(strings)).toContain('clientID');
  });

  it('adds the client ID meta-data to the manifest', async () => {
    const manifest = await runMod(apply(ANDROID), 'android', 'manifest', {
      manifest: { application: [{ $: { 'android:name': '.MainApplication' } }] },
    });
    const meta = manifest.manifest.application[0]['meta-data'];
    expect(meta).toContainEqual({
      $: {
        'android:name': 'com.truecaller.android.sdk.ClientId',
        'android:value': '@string/clientID',
      },
    });
  });
});

describe('iOS setup', () => {
  it('writes Info.plist keys, URL scheme and query scheme', async () => {
    const plist = await runMod(apply(IOS), 'ios', 'infoPlist', {});
    expect(plist.TruecallerAppKey).toBe('ios-key');
    expect(plist.TruecallerAppLink).toBe(IOS.iosAppLink);
    expect(plist.LSApplicationQueriesSchemes).toContain('truesdk');
    expect(plist.CFBundleURLTypes).toContainEqual({
      CFBundleURLSchemes: ['truecallersdk-ios-key'],
    });
  });

  it('is idempotent for existing plist entries', async () => {
    const plist = await runMod(apply(IOS), 'ios', 'infoPlist', {
      LSApplicationQueriesSchemes: ['truesdk'],
      CFBundleURLTypes: [{ CFBundleURLSchemes: ['truecallersdk-ios-key'] }],
    });
    expect(plist.LSApplicationQueriesSchemes).toEqual(['truesdk']);
    expect(plist.CFBundleURLTypes).toHaveLength(1);
  });

  it('adds the associated domain from the app link host', async () => {
    const ent = await runMod(apply(IOS), 'ios', 'entitlements', {});
    expect(ent['com.apple.developer.associated-domains']).toEqual([
      'applinks:truecaller.example.com',
    ]);
  });

  it('does not duplicate an existing associated domain', async () => {
    const ent = await runMod(apply(IOS), 'ios', 'entitlements', {
      'com.apple.developer.associated-domains': ['applinks:truecaller.example.com'],
    });
    expect(ent['com.apple.developer.associated-domains']).toHaveLength(1);
  });

  it('falls back to string stripping for a non-URL app link', async () => {
    const ent = await runMod(
      apply({ iosAppKey: 'k', iosAppLink: 'truecaller.example.com/path' }),
      'ios',
      'entitlements',
      {}
    );
    expect(ent['com.apple.developer.associated-domains']).toEqual([
      'applinks:truecaller.example.com',
    ]);
  });
});

describe('Podfile edits', () => {
  const podfile = 'target "App" do\nend\n';

  it('adds the Assets.car fix in a new post_integrate hook', async () => {
    const out = await runMod(apply(IOS), 'ios', 'podfile', { contents: podfile });
    expect(out.contents).toContain("ENV['EXPO_TRUECALLER_IOS_ENABLED'] = 'true'");
    expect(out.contents).toContain('post_integrate do |installer|');
    expect(out.contents).toContain('Fix TrueSDK Assets.car collision (start)');
  });

  it('injects into an existing post_integrate hook', async () => {
    const existing = `${podfile}\npost_integrate do |installer|\n  puts 'hi'\nend\n`;
    const out = await runMod(apply(IOS), 'ios', 'podfile', { contents: existing });
    expect(out.contents.match(/post_integrate do/g)).toHaveLength(1);
    expect(out.contents).toContain('Fix TrueSDK Assets.car collision (start)');
    expect(out.contents).toContain("puts 'hi'");
  });

  it('is idempotent across repeated prebuilds', async () => {
    const config = apply(IOS);
    const once = await runMod(config, 'ios', 'podfile', { contents: podfile });
    const twice = await runMod(apply(IOS), 'ios', 'podfile', { contents: once.contents });
    expect(twice.contents.match(/Assets\.car collision \(start\)/g)).toHaveLength(1);
    expect(twice.contents.match(/EXPO_TRUECALLER_IOS_ENABLED/g)).toHaveLength(1);
  });
});
