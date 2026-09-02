const path = require('path');

const { FusesPlugin } = require('@electron-forge/plugin-fuses');

const {
  FuseV1Options,
  FuseVersion
} = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,

  osxSign: false,

  osxNotarize: false,

  appBundleId: 'com.discout.app',

  osxTarget: 'x64',

    executableName: 'disc-out',

    icon: path.resolve(
      __dirname,
      'favicon_io',
      'favicon.ico'
    ),
  },

  rebuildConfig: {
    onlyModules: [],
  },

  makers: [

   {
    name: '@electron-forge/maker-squirrel',
    config: {
      name: 'disc_out',
      authors: 'Leandro',
      exe: 'disc-out.exe',
      setupIcon: path.resolve(__dirname, 'favicon_io', 'favicon.ico'),
      // iconUrl: path.resolve(__dirname, 'favicon_io', 'favicon.ico'),
      setupExe: 'Disc-OutSetup.exe',
      setupMsi: 'Disc-Out.msi',
      certificateFile: process.env.CERTIFICATE_FILE,
      certificatePassword: process.env.CERTIFICATE_PASSWORD,
      signWithParams: '/f ' + process.env.CERTIFICATE_FILE + ' /p ' + process.env.CERTIFICATE_PASSWORD + ' /tr http://timestamp.comodoca.com /td sha256',
      remoteReleases: '',
      remoteToken: ''
    }
  }
    // macOS DMG
    // {
    //   name: '@electron-forge/maker-dmg',
    //   platforms: ['darwin'],
    // },

    // // Linux DEB
    // {
    //   name: '@electron-forge/maker-deb',
    //   platforms: ['linux'],
    // },

    // // Linux RPM
    // {
    //   name: '@electron-forge/maker-rpm',
    //   platforms: ['linux'],
    // },
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