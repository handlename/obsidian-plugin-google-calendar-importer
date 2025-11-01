# Codebase Structure

## Root Directory Files
- `main.ts` - Main plugin entry point
- `manifest.json` - Plugin metadata (id, name, version, etc.)
- `package.json` - NPM package configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc` - ESLint configuration
- `esbuild.config.mjs` - Build configuration
- `version-bump.mjs` - Version bumping script
- `styles.css` - Plugin styles
- `versions.json` - Version compatibility mapping

## Main Code Structure (main.ts)
The main.ts file contains the core plugin logic with:
- `MyPluginSettings` interface - Plugin settings interface
- `DEFAULT_SETTINGS` constant - Default settings values
- `MyPlugin` class - Main plugin class extending Obsidian's Plugin
- `SampleModal` class - Example modal implementation
- `SampleSettingTab` class - Settings tab implementation

## Build Output
- `main.js` - Compiled plugin code (generated from main.ts)

## Configuration Files
- TypeScript strict mode enabled with null checks
- Module system: ESNext
- Target: ES6
- Source maps inlined for debugging
