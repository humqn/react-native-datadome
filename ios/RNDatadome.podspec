require 'json'

package = JSON.parse(File.read(File.join(File.expand_path('..'), 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RNDatadome"
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, "9.0"

  s.source       = { :git => "https://github.com/datadome/react-native-datadome.git" }
  s.source_files  = "RNDatadome/*.{h,m}"

  s.dependency 'React'
end
