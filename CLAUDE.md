# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VSIX Manifest Designer is a VS Code extension that provides a visual designer for VS Code extension manifest (`package.json`) files using the Custom Editor API.

## Build Commands

```bash
npm run install:all      # Install all dependencies (root + webview-ui)
npm run compile          # Build extension and webview
npm run compile:extension  # Build extension only
npm run compile:webview    # Build webview only
npm run watch            # Watch extension for changes
npm run watch:webview    # Watch webview for changes (dev server)
npm run package          # Create VSIX package
```

## Development

1. Run `npm run install:all` to install all dependencies
2. Run `npm run compile` to build everything
3. Press F5 in VS Code to launch the Extension Development Host

For webview development, run `npm run watch:webview` in a separate terminal for hot reload.

## Architecture

```
src/                              # Extension code (TypeScript)
├── extension.ts                  # Extension entry point
├── editor/
│   └── ManifestEditorProvider.ts # Custom editor provider
├── models/
│   ├── index.ts                  # Model exports
│   └── VscodeManifest.ts         # TypeScript interfaces for manifest
├── services/
│   ├── index.ts                  # Service exports
│   ├── ManifestService.ts        # Parse/serialize with round-trip preservation
│   └── ValidationService.ts      # Field validation
└── webview/
    ├── getNonce.ts               # CSP nonce generator
    └── getWebviewContent.ts      # Webview HTML generator (loads Svelte bundle)

webview-ui/                       # Webview code (Svelte + Vite)
├── src/
│   ├── main.ts                   # Svelte app entry point
│   ├── App.svelte                # Root component
│   ├── stores/
│   │   └── manifestStore.ts      # Svelte stores for state management
│   ├── components/
│   │   ├── Navigation.svelte     # Sidebar navigation
│   │   └── views/
│   │       └── MetadataView.svelte  # Metadata editing view
│   └── styles/
│       └── global.css            # Global styles with VS Code theming
├── vite.config.ts                # Vite build configuration
└── package.json                  # Webview dependencies

out/                              # Build output
├── extension.js                  # Bundled extension
└── webview/
    ├── main.js                   # Bundled Svelte app
    └── assets/
        └── main.css              # Extracted CSS
```

### Models

**VscodeManifest.ts** defines TypeScript interfaces for all VS Code extension manifest fields:
- Core fields: name, version, publisher, engines
- Display: displayName, description, icon, categories
- Contributions: commands, configuration, menus, keybindings, views, languages, grammars, themes, snippets, custom editors, and more
- Marketplace: galleryBanner, badges, repository

### Services

**ManifestService** handles parsing and serialization:
- `parse(content)` - Parse JSON to VscodeManifest, detect indentation
- `serialize(manifest, options)` - Convert back to JSON preserving formatting
- `update(original, updates)` - Merge updates without losing other fields
- `detectExtension(manifest)` - Check if package.json is a VS Code extension
- `initializeAsExtension(manifest)` - Add minimal extension fields

**ValidationService** validates manifest fields:
- `validate(manifest)` - Full validation returning errors/warnings/info
- `validateField(field, value)` - Single field validation
- Checks: required fields, formats (semver, npm name), categories, commands, configuration, activation events, best practices

### Webview UI (Svelte)

The webview is built with Svelte + Vite for a reactive, component-based UI.

**Stores** (`manifestStore.ts`):
- `manifestStore` - Main store with manifest data, validation, detection status
- `navigationStore` - Current view selection
- Helper functions: `postMessage()`, `getVsCodeApi()`

**Views**:
- `MetadataView` - Edit name, displayName, version, publisher, description, categories, icon, galleryBanner, keywords
- Placeholder views for: Activation, Contributions, Capabilities, Marketplace

**Theming**: Uses VS Code CSS custom properties (`--vscode-*`) for seamless theme integration.

## Key Patterns

### Custom Editor Registration

The extension uses `vscode.window.registerCustomEditorProvider` with:
- View type: `vsixManifestDesigner.editor`
- Priority: `option` (user can choose to open with designer)
- File pattern: `package.json`

### Webview Communication

Messages from extension to webview:
- `update` - Parsed manifest, detection result, validation result
- `parseError` - JSON parse error with line/column

Messages from webview to extension:
- `ready` - Webview initialized, request data
- `edit` - Raw content edit
- `updateManifest` - Partial manifest updates (preserves other fields)
- `initializeAsExtension` - Add engines.vscode, contributes, activationEvents
- `closeEditor` - Close designer, open with default editor

### Round-Trip Preservation

ManifestService preserves:
- Original indentation (spaces or tabs)
- Trailing newline presence
- Non-extension fields (scripts, dependencies, etc.)

### Extension Detection

A package.json is considered a VS Code extension if it has any of:
- `engines.vscode`
- `contributes` (non-empty)
- `activationEvents` (non-empty)

If none are present, webview offers to initialize as extension or close.

### Content Security Policy

Webview uses strict CSP with nonce-based script execution for security.

## Testing

To test the extension:
1. Run `npm run install:all` and `npm run compile`
2. Press F5 to launch Extension Development Host
3. Open a folder with a `package.json` file
4. Right-click the `package.json` file
5. Select "Open With..." > "Extension Manifest Designer"
6. For VS Code extension manifests: see Metadata view with validation
7. For regular package.json: see prompt to initialize or close
