const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withCompactApk(config) {
  return withGradleProperties(config, (config) => {
    // Restrict architectures to ARM only (phones). This removes x86/x86_64 (emulators),
    // cutting the single universal APK size in half.
    config.modResults.push({
      type: 'property',
      key: 'reactNativeArchitectures',
      value: 'armeabi-v7a,arm64-v8a',
    });
    return config;
  });
};
