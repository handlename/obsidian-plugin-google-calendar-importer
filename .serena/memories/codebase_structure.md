# Codebase Structure

## Root Directory Files
- `main.ts` - Main plugin entry point
- `manifest.json` - Plugin metadata (id, name, version, etc.)
- `package.json` - NPM package configuration
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Biome linter and formatter configuration
- `esbuild.config.mjs` - Build configuration
- `styles.css` - Plugin styles
- `versions.json` - Version compatibility mapping

## Directory Structure
- `scripts/` - Build and release scripts
  - `prepare-release.mjs` - Copies release files to `release/` directory
- `.github/` - GitHub configuration
  - `workflows/` - GitHub Actions workflows
    - `ci.yml` - Continuous integration workflow
    - `tagpr.yml` - tagpr automated release workflow
- `release/` - Release artifacts (gitignored)

## Main Code Structure (main.ts)
The main.ts file contains the core plugin logic with:
- Plugin settings interface and defaults
- Main plugin class extending Obsidian's Plugin
- Modal implementations
- Settings tab implementation
- Google Calendar integration logic

## Build Output
- `main.js` - Compiled plugin code (generated from main.ts)
- Generated and placed in project root

## Configuration Files
- TypeScript strict mode enabled with null checks
- Module system: ESNext
- Target: ES6
- Source maps inlined for debugging

## Release Workflow
- `.tagpr` - tagpr configuration for automated version management
  - Manages versions in: manifest.json, package.json, versions.json
  - Executes: `npm run build && npm run release`
  - Creates draft releases on GitHub
  - Uses PR labels (major/minor) for version bumping

## Version Management
- `manifest.json` - Plugin version and metadata
- `package.json` - NPM package version
- `versions.json` - Obsidian compatibility mapping
- All three files are automatically updated by tagpr
