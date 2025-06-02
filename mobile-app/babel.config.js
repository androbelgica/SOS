module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@config': './src/config',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts',
            '@theme': './src/theme',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
