module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Enable legacy decorators (required by WatermelonDB model decorators)
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // Ensure class properties work in legacy decorator mode
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    // Reanimated v4 moved the plugin to react-native-worklets; keep this last
    'react-native-worklets/plugin',
  ],
};
