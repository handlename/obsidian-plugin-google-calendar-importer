# Suggested Commands

## Development Commands

### Install Dependencies
```bash
npm i
```

### Development Mode (Watch)
```bash
npm run dev
```
Starts esbuild in watch mode, automatically recompiles on changes.

### Build (Production)
```bash
npm run build
```
Runs TypeScript type checking and builds the production bundle.

### Linting
```bash
npm run lint
```
Checks code with Biome linter.

```bash
npm run lint:fix
```
Auto-fixes lint issues with Biome.

### Formatting
```bash
npm run format
```
Formats code with Biome.

### Type Checking Only
```bash
npx tsc -noEmit -skipLibCheck
```

### Release Preparation
```bash
npm run release
```
Builds the plugin and prepares release files in `release/` directory. Copies main.js, manifest.json, and styles.css.

## Release Workflow

### Version Management
Version updates are handled by tagpr automatically through `.tagpr` configuration:
- tagpr updates `manifest.json`, `package.json`, and `versions.json`
- tagpr runs `npm run build && npm run release` command
- Release files are prepared in `release/` directory
- GitHub workflow uploads release assets automatically

### PR Labels for Version Bumping
- `major` label - Major version bump (breaking changes)
- `minor` label - Minor version bump (new features)
- Default - Patch version bump (bug fixes)

## System Utilities (macOS/Darwin)

### File Operations
- `ls` - List files
- `cat <file>` - View file contents
- `grep <pattern> <file>` - Search in files
- `find . -name <pattern>` - Find files

### Git Commands
- `git status` - Check repository status
- `git add <files>` - Stage files
- `git commit -S -m "<message>"` - Commit changes with GPG signature
- `git log` - View commit history
- `git diff` - View changes

### Node Version Check
```bash
node --version
```
Should be v24 or compatible.

## GitHub CLI Commands

### Pull Request
```bash
gh pr create --title "<title>" --body "<body>" --base main
```

### View Repository
```bash
gh repo view
```
