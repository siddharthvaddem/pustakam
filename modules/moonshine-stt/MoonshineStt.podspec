Pod::Spec.new do |s|
  s.name           = 'MoonshineStt'
  s.version        = '0.1.0'
  s.summary        = 'On-device Moonshine speech-to-text bridge'
  s.description    = 'Wraps the vendored Moonshine C library and Swift bindings (v0.1.5). The model is downloaded after install (see modules/model-store).'
  s.license        = 'MIT'
  s.author         = 'memory-bank'
  s.homepage       = 'https://github.com/moonshine-ai/moonshine'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/**/*.swift'
  s.vendored_frameworks = 'ios/Frameworks/Moonshine.xcframework'
  s.libraries = 'c++'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
