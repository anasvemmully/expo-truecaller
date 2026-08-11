require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

truecaller_ios_enabled = ENV['EXPO_TRUECALLER_IOS_ENABLED'] != 'false'

Pod::Spec.new do |s|
  s.name           = 'ExpoTruecaller'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '16.4'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/anasvemmully/expo-truecaller' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  if truecaller_ios_enabled
    s.dependency 'TrueSDK'
    s.source_files = "Enabled/**/*.{h,m,mm,swift,hpp,cpp}"
  else
    s.source_files = "Disabled/**/*.{h,m,mm,swift,hpp,cpp}"
  end
end
