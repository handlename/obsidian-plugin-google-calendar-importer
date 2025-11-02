# Code Style and Conventions

## TypeScript Configuration
- **Strict Type Checking**: Enabled
  - `noImplicitAny: true`
  - `strictNullChecks: true`
- **Module System**: ESNext
- **Target**: ES6
- **Source Maps**: Inlined for debugging

## Biome Configuration
- **Linter**: Enabled with recommended rules
- **Formatter**: Enabled
  - Indent style: tabs
  - Line width: 80
  - Ignore unknown files: false
- **Use Ignore File**: true (.gitignore respected)
- **Editor Integration**: VCS enabled, format on save recommended

## Import Style
- ES module imports
- Import from 'obsidian' package for framework types and classes
- **Node.js builtin modules**: Use `node:` protocol (e.g., `node:fs`, `node:path`)

## Naming Conventions
- **Classes**: PascalCase (e.g., `MyPlugin`, `SampleModal`)
- **Interfaces**: PascalCase with descriptive names (e.g., `MyPluginSettings`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SETTINGS`)

## Code Organization
- Main plugin class extends Obsidian's `Plugin` class
- Modal classes extend `Modal`
- Setting tabs extend `PluginSettingTab`
- Settings interfaces define plugin configuration structure
- Scripts should be placed in `scripts/` directory

## Comments
- **禁止**: 単純な処理(単発の関数呼び出しなど)に対する冗長なコメント
- **推奨**: コードのみからではその意図が伝わりにくい処理への説明コメント

## Commit Conventions
- **Must**: GPG署名を必須とする (`-S` フラグ)
- **Must**: Conventional Commits形式を使用
  - `feat:` - 新機能
  - `fix:` - バグ修正
  - `docs:` - ドキュメント変更
  - `style:` - コードスタイル変更
  - `refactor:` - リファクタリング
  - `perf:` - パフォーマンス改善
  - `test:` - テスト追加・修正
  - `chore:` - ビルドプロセスや補助ツールの変更

## Release Files
- Build output: `main.js`
- Configuration: `manifest.json`
- Styles: `styles.css`
- Version tracking: `versions.json`
- Release artifacts are prepared in `release/` directory (gitignored)
