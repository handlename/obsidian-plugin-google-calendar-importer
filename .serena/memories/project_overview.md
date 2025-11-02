# Project Overview

## Purpose
This is an Obsidian plugin project for Google Calendar Importer. It imports Google Calendar events into Obsidian Daily Notes with customizable templates and timezone conversion support.

Obsidian is a knowledge base that works on top of a local folder of plain text Markdown files.

## Tech Stack
- **Language**: TypeScript 5.9.3
- **Runtime**: Node.js v24+
- **Build Tool**: esbuild 0.24.0
- **Plugin Framework**: Obsidian Plugin API
- **Linter**: Biome 2.3.2
- **Type Checking**: TypeScript compiler

## Project Type
This is an Obsidian plugin project that extends the functionality of the Obsidian note-taking application. This is a desktop-only plugin.

## Key Dependencies
- `obsidian` - Latest Obsidian plugin API
- `esbuild` - Fast JavaScript bundler
- `typescript` - TypeScript compiler
- `@biomejs/biome` - Fast linter and formatter
- `googleapis` - Google APIs client library
- `mustache` - Template engine
- `date-fns` - Date utility library
- `date-fns-tz` - Timezone support for date-fns

## Key Features
- Import Google Calendar events into Daily Notes
- Customizable Mustache templates
- Timezone conversion support
- Desktop-only functionality
