const path = require('path');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');

const {
  FuseV1Options,
  FuseVersion
} = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,

    icon: path.resolve(
    __dirname,
    'src/favicon_io/favicon'
  ),
  },

  rebuildConfig: {
    onlyModules: [],
  },

  makers: [
    // Windows installer
    {
      name: '@electron-forge/maker-wix',
      platforms: ['win32'],
      config: {
        manufacturer: 'Disc-Out',
        name: 'Disc-Out',
      },
    },

    // macOS DMG
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
    },

    // Linux
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {},
    },

    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {},
    },
  ],

  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,

      [FuseV1Options.RunAsNode]: false,

      [FuseV1Options.EnableCookieEncryption]: true,

      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,

      [FuseV1Options.EnableNodeCliInspectArguments]: false,

      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,

      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};