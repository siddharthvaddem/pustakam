Pod::Spec.new do |s|
  s.name           = 'LiteRtLm'
  s.version        = '0.1.0'
  s.summary        = 'On-device LiteRT-LM bridge'
  s.description    = 'Google\'s LiteRT-LM v0.18.0 engine and Swift API.'
  s.license        = 'MIT'
  s.author         = 'memory-bank'
  s.homepage       = 'https://github.com/google-ai-edge/LiteRT-LM'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/**/*.swift'
  s.vendored_frameworks = 'ios/Frameworks/CLiteRTLM.xcframework'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
