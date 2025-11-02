# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.0.2](https://github.com/handlename/obsidian-plugin-google-calendar-importer/compare/v0.0.1...v0.0.2) - 2025-11-02

## [v0.0.1](https://github.com/handlename/obsidian-plugin-google-calendar-importer/commits/v0.0.1) - 2025-11-02

### Added

- Initial release of Google Calendar Importer plugin
- Import Google Calendar events into Daily Notes
- Customizable templates for normal and all-day events
- Timezone conversion support
- Service account authentication
- Validation for settings (service account key, calendar ID, templates)
- Error handling with user-friendly Japanese messages
- Command palette integration: "Import Google Calendar events"
- Settings tab with real-time validation status

### Features

#### Core Functionality
- Fetch events from Google Calendar API for a specific date
- Insert formatted events at cursor position in Daily Notes
- Support for both normal events (with time) and all-day events

#### Template System
- Mustache-based template engine
- Available variables: `{{title}}`, `{{startTime}}`, `{{endTime}}`, `{{description}}`, `{{location}}`, `{{attendees}}`
- Separate templates for normal and all-day events
- Default templates in Japanese

#### Architecture
- Clean architecture with Infrastructure, Application, and Presentation layers
- TypeScript 5.9.3 with strict mode
- Biome for linting and formatting
- Comprehensive error handling with 11 error codes

### Technical Details

- **Node.js**: v24
- **TypeScript**: 5.9.3
- **Build Tool**: esbuild 0.24.0
- **Linter/Formatter**: Biome 2.3.2
- **Dependencies**:
  - googleapis 140.0.1
  - date-fns 4.1.0
  - date-fns-tz 3.2.0
  - mustache 4.2.0

### Documentation

- Comprehensive README.md with usage instructions
- Detailed SETUP_GUIDE.md for Google Cloud Console configuration
- Inline code documentation
- Example templates

### Limitations

- Desktop-only (requires Node.js modules)
- Single calendar support (no multiple calendar import in one operation)
- Read-only access (cannot modify calendar events)
- Requires manual service account setup

### Known Issues

- None at initial release

## Future Enhancements

Planned features for future versions:

- [ ] Multiple calendar support (FR-008)
- [ ] Timezone selection dropdown with IANA timezone list (TASK-027)
- [ ] Cache mechanism to prevent duplicate imports
- [ ] Event filtering by keywords or attendees
- [ ] OAuth 2.0 authentication option
- [ ] Mobile support (requires authentication method change)

---

## Version History

### Version Numbering

- **Major version** (X.0.0): Breaking changes, major feature additions
- **Minor version** (0.X.0): New features, backwards compatible
- **Patch version** (0.0.X): Bug fixes, minor improvements

### Release Process

1. Update version in `manifest.json` and `versions.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag -a 0.1.0 -m "Release v0.1.0"`
4. Build release: `npm run build`
5. Create GitHub release with `main.js`, `manifest.json`, `styles.css`

[Unreleased]: https://github.com/handlename/obsidian-plugin-google-calendar-importer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/handlename/obsidian-plugin-google-calendar-importer/releases/tag/v0.1.0
