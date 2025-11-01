# Code Style and Conventions

## TypeScript Configuration
- **Strict Type Checking**: Enabled
  - `noImplicitAny: true`
  - `strictNullChecks: true`
- **Module System**: ESNext
- **Target**: ES6
- **Source Maps**: Inlined for debugging

## ESLint Rules
- Based on recommended TypeScript ESLint config
- **Unused Variables**: Error (but args allowed to be unused)
- **TS Comments**: Ban disabled (allows @ts-ignore, @ts-expect-error)
- **Empty Functions**: Allowed
- **Prototype Builtins**: Check disabled

## Naming Conventions
- **Classes**: PascalCase (e.g., `MyPlugin`, `SampleModal`)
- **Interfaces**: PascalCase with descriptive names (e.g., `MyPluginSettings`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SETTINGS`)

## Code Organization
- Main plugin class extends Obsidian's `Plugin` class
- Modal classes extend `Modal`
- Setting tabs extend `PluginSettingTab`
- Settings interfaces define plugin configuration structure

## Import Style
- ES module imports
- Import from 'obsidian' package for framework types and classes
