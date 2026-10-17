Pod::Spec.new do |s|
  s.name           = 'ModelStore'
  s.version        = '0.1.0'
  s.summary        = 'Downloads and keeps on-device model files'
  s.description    = 'Resumable, checksum-verified downloads of model files into storage that is not backed up.'
  s.license        = 'MIT'
  s.author         = 'memory-bank'
  s.homepage       = 'https://github.com/siddharthvaddem/pustakam'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/**/*.swift'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
