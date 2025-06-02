const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db',
  // Add other file extensions you need
  'bin',
  'txt',
  'jpg',
  'png',
  'webp',
  'gif',
  'mp4',
  'webm',
  'wav',
  'mp3',
  'aac',
  'pdf'
);

// Add support for TypeScript files
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

module.exports = config;
