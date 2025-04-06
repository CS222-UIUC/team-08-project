// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       'expo-router/babel',
//       ["module:react-native-dotenv", {
//         "moduleName": "@env",
//         "path": ".env",
//         "blacklist": null,
//         "whitelist": null,
//         "safe": false,
//         "allowUndefined": true
//       }]
//     ]
//   };
// };

// module.exports = function (api) {
//     api.cache(true);
//     return {
//       presets: ['babel-preset-expo'],
//     };
//   };

module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        ['babel-plugin-dotenv-import', {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        }],
      ],
    };
  };
  