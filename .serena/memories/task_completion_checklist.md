# Task Completion Checklist

## Before Committing Code

### 1. Type Checking
Run TypeScript compiler to ensure no type errors:
```bash
npx tsc -noEmit -skipLibCheck
```
or use the build command:
```bash
npm run build
```

### 2. Linting
Run ESLint to check for code quality issues:
```bash
npx eslint main.ts
```
or for all TypeScript files:
```bash
npx eslint *.ts
```

### 3. Manual Testing
- Reload the plugin in Obsidian to test changes
- Test all modified functionality
- Check console for errors (Cmd+Option+I in Obsidian)

### 4. Build Verification
Ensure the plugin builds successfully:
```bash
npm run build
```

## Testing Guidelines
This project template doesn't include automated tests by default. Testing is done manually in Obsidian:
1. Build the plugin
2. Copy/link to `.obsidian/plugins/` folder
3. Reload Obsidian
4. Test functionality

## Release Process
1. Update `minAppVersion` in `manifest.json` if needed
2. Run version bump: `npm version patch|minor|major`
3. Commit changes
4. Create GitHub release with tag
5. Upload `manifest.json`, `main.js`, `styles.css` to release
