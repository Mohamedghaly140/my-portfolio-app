const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Restricts Supported Destinations to iPhone only, dropping the automatic
 * "Mac (Designed for iPhone)" and "Apple Vision (Designed for iPhone)"
 * compatibility destinations Xcode 15+ adds by default.
 *
 * `SUPPORTED_DESTINATIONS` is not a real Xcode setting. The destinations UI
 * is driven by TARGETED_DEVICE_FAMILY plus the Designed-for-iPhone flags.
 */
const withIphoneOnlyDestination = (config) =>
  withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key in configurations) {
      const buildSettings = configurations[key]?.buildSettings;
      if (buildSettings?.PRODUCT_NAME !== undefined) {
        delete buildSettings.SUPPORTED_DESTINATIONS;
        buildSettings.TARGETED_DEVICE_FAMILY = '"1"';
        buildSettings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        buildSettings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO';
      }
    }

    return config;
  });

module.exports = withIphoneOnlyDestination;
