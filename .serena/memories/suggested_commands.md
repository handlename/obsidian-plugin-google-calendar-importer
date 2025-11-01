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
npx eslint main.ts
```
or for all TypeScript files:
```bash
npx eslint *.ts
```

### Type Checking Only
```bash
npx tsc -noEmit -skipLibCheck
```

### Version Bumping
```bash
npm version patch  # for patch version
npm version minor  # for minor version
npm version major  # for major version
```
This automatically updates manifest.json and versions.json.

## System Utilities (macOS/Darwin)

### File Operations
- `ls` - List files
- `cat <file>` - View file contents
- `grep <pattern> <file>` - Search in files
- `find . -name <pattern>` - Find files

### Git Commands
- `git status` - Check repository status
- `git add <files>` - Stage files
- `git commit -m "<message>"` - Commit changes
- `git log` - View commit history
- `git diff` - View changes

### Node Version Check
```bash
node --version
```
Should be v16 or higher.
