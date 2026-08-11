import {
  AndroidConfig,
  ConfigPlugin,
  createRunOncePlugin,
  withAndroidManifest,
  withStringsXml,
  withInfoPlist,
  withEntitlementsPlist,
  withPodfile,
  withGradleProperties,
} from '@expo/config-plugins';
import type { URLScheme } from '@expo/config-plugins/build/ios/IosConfig.types';

import pkg from '../../package.json';

export type ExpoTruecallerPluginOptions = {
  androidClientId?: string;
  iosAppKey?: string;
  iosAppLink?: string;
};

const CLIENT_ID_META_NAME = 'com.truecaller.android.sdk.ClientId';
const CLIENT_ID_STRING_NAME = 'clientID';

const KNOWN_OPTIONS = ['androidClientId', 'iosAppKey', 'iosAppLink'];

function validateOptions(options: ExpoTruecallerPluginOptions): void {
  for (const optionName of Object.keys(options)) {
    if (!KNOWN_OPTIONS.includes(optionName)) {
      throw new Error(
        `expo-truecaller: unknown plugin option "${optionName}". Valid options are: ` +
          `${KNOWN_OPTIONS.join(', ')}. TcSdkOptions customization (buttonColor, footerType, ` +
          `etc.) is no longer a plugin option - pass it to ExpoTruecaller.initialize(options) instead.`
      );
    }
  }
}

const withTruecallerClientIdString: ConfigPlugin<{ androidClientId: string }> = (
  config,
  { androidClientId }
) => {
  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [
        AndroidConfig.Resources.buildResourceItem({
          name: CLIENT_ID_STRING_NAME,
          value: androidClientId,
        }),
      ],
      config.modResults
    );
    return config;
  });
};

const withTruecallerManifest: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      CLIENT_ID_META_NAME,
      `@string/${CLIENT_ID_STRING_NAME}`
    );

    return config;
  });
};

const withTruecallerIOSPlist: ConfigPlugin<{ iosAppKey: string; iosAppLink: string }> = (
  config,
  { iosAppKey, iosAppLink }
) => {
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;

    const schemes: string[] = (plist.LSApplicationQueriesSchemes as string[]) ?? [];
    if (!schemes.includes('truesdk')) schemes.push('truesdk');
    plist.LSApplicationQueriesSchemes = schemes;

    const urlScheme = `truecallersdk-${iosAppKey}`;
    const urlTypes: URLScheme[] = plist.CFBundleURLTypes ?? [];
    if (!urlTypes.some((t) => t.CFBundleURLSchemes?.includes(urlScheme))) {
      urlTypes.push({ CFBundleURLSchemes: [urlScheme] });
    }
    plist.CFBundleURLTypes = urlTypes;

    plist['TruecallerAppKey'] = iosAppKey;
    plist['TruecallerAppLink'] = iosAppLink;

    return config;
  });
};

const withTruecallerIOSAssociatedDomains: ConfigPlugin<{ iosAppLink: string }> = (
  config,
  { iosAppLink }
) => {
  return withEntitlementsPlist(config, (config) => {
    let domain: string;
    try {
      domain = new URL(iosAppLink).hostname;
    } catch {
      domain = iosAppLink.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    }

    const domains: string[] =
      (config.modResults['com.apple.developer.associated-domains'] as string[]) ?? [];
    const entry = `applinks:${domain}`;
    if (!domains.includes(entry)) domains.push(entry);
    config.modResults['com.apple.developer.associated-domains'] = domains;

    return config;
  });
};

const ASSETS_CAR_FIX_START = '# [expo-truecaller] Fix TrueSDK Assets.car collision (start)';
const ASSETS_CAR_FIX_END = '# [expo-truecaller] Fix TrueSDK Assets.car collision (end)';

const ASSETS_CAR_FIX = `${ASSETS_CAR_FIX_START}
assets_car = '\${TARGET_BUILD_DIR}/\${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Assets.car'

installer.aggregate_targets.each do |aggregate_target|
  user_project = aggregate_target.user_project
  next unless user_project

  changed = false
  user_project.native_targets.each do |native_target|
    native_target.build_phases.each do |build_phase|
      next unless build_phase.respond_to?(:name) && build_phase.name == '[CP] Copy Pods Resources'
      next unless build_phase.respond_to?(:output_paths)

      original_output_paths = build_phase.output_paths.dup
      build_phase.output_paths = build_phase.output_paths.reject { |output_path| output_path == assets_car }
      changed ||= original_output_paths != build_phase.output_paths
    end
  end

  user_project.save if changed
end

Dir.glob(File.join(installer.sandbox.root, 'Target Support Files', 'Pods-*', '*resources-output-files.xcfilelist')).each do |filelist_path|
  lines = File.readlines(filelist_path)
  next_lines = lines.reject { |line| line.strip == assets_car }
  File.write(filelist_path, next_lines.join) if next_lines != lines
end
${ASSETS_CAR_FIX_END}`;

function removeTaggedBlock(contents: string, start: string, end: string): string {
  const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingBlock = new RegExp(`\\n?\\s*${escapedStart}[\\s\\S]*?\\s*${escapedEnd}\\n?`, 'm');
  return contents.replace(existingBlock, '\n');
}

function addAssetsCarFix(podfile: string): string {
  const nextPodfile = removeTaggedBlock(podfile, ASSETS_CAR_FIX_START, ASSETS_CAR_FIX_END);
  const postIntegrateHook = /^(\s*)post_integrate\s+do\s+\|\s*installer\s*\|\s*$/m;

  if (postIntegrateHook.test(nextPodfile)) {
    return nextPodfile.replace(
      postIntegrateHook,
      (match, indent) => `${match}\n${ASSETS_CAR_FIX.replace(/^/gm, `${indent}  `)}`
    );
  }

  return `${nextPodfile.trimEnd()}\n\npost_integrate do |installer|\n${ASSETS_CAR_FIX.replace(/^/gm, '  ')}\nend\n`;
}

const withTruecallerIOSAssetsCarFix: ConfigPlugin = (config) => {
  return withPodfile(config, (config) => {
    config.modResults.contents = addAssetsCarFix(config.modResults.contents);
    return config;
  });
};

const IOS_ENABLED_FLAG_START = '# [expo-truecaller] TrueSDK enabled flag (start)';
const IOS_ENABLED_FLAG_END = '# [expo-truecaller] TrueSDK enabled flag (end)';

const withTruecallerIOSEnabledFlag: ConfigPlugin<{ enabled: boolean }> = (config, { enabled }) => {
  return withPodfile(config, (config) => {
    const nextContents = removeTaggedBlock(
      config.modResults.contents,
      IOS_ENABLED_FLAG_START,
      IOS_ENABLED_FLAG_END
    );
    const flagBlock = `${IOS_ENABLED_FLAG_START}\nENV['EXPO_TRUECALLER_IOS_ENABLED'] = '${enabled}'\n${IOS_ENABLED_FLAG_END}\n`;
    config.modResults.contents = `${flagBlock}${nextContents}`;
    return config;
  });
};

const withTruecallerAndroidEnabledFlag: ConfigPlugin<{ enabled: boolean }> = (
  config,
  { enabled }
) => {
  return withGradleProperties(config, (config) => {
    const key = 'expoTruecallerAndroidEnabled';
    const existingIndex = config.modResults.findIndex(
      (item) => item.type === 'property' && item.key === key
    );
    const property: AndroidConfig.Properties.PropertiesItem = {
      type: 'property',
      key,
      value: String(enabled),
    };
    if (existingIndex >= 0) {
      config.modResults[existingIndex] = property;
    } else {
      config.modResults.push(property);
    }
    return config;
  });
};

const withExpoTruecaller: ConfigPlugin<ExpoTruecallerPluginOptions> = (config, options = {}) => {
  const { androidClientId, iosAppKey, iosAppLink } = options;

  validateOptions(options);

  if (iosAppKey && !iosAppLink) {
    throw new Error('expo-truecaller: "iosAppLink" is required when "iosAppKey" is provided.');
  }
  if (iosAppLink && !iosAppKey) {
    throw new Error('expo-truecaller: "iosAppKey" is required when "iosAppLink" is provided.');
  }

  config = withTruecallerAndroidEnabledFlag(config, { enabled: !!androidClientId });
  config = withTruecallerIOSEnabledFlag(config, { enabled: !!(iosAppKey && iosAppLink) });

  if (androidClientId) {
    config = withTruecallerClientIdString(config, { androidClientId });
    config = withTruecallerManifest(config);
  }

  if (iosAppKey && iosAppLink) {
    config = withTruecallerIOSAssetsCarFix(config);
    config = withTruecallerIOSPlist(config, { iosAppKey, iosAppLink });
    config = withTruecallerIOSAssociatedDomains(config, { iosAppLink });
  }

  return config;
};

export default createRunOncePlugin<ExpoTruecallerPluginOptions>(
  withExpoTruecaller,
  pkg.name,
  pkg.version
);
