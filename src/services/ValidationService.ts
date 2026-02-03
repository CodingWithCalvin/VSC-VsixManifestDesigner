import { VscodeManifest, Category } from '../models';

/**
 * Validation error with field path and message
 */
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

/**
 * Valid VS Code extension categories
 */
const VALID_CATEGORIES: Category[] = [
  'Azure',
  'Data Science',
  'Debuggers',
  'Education',
  'Extension Packs',
  'Formatters',
  'Keymaps',
  'Language Packs',
  'Linters',
  'Machine Learning',
  'Notebooks',
  'Other',
  'Programming Languages',
  'SCM Providers',
  'Snippets',
  'Testing',
  'Themes',
  'Visualization',
];

/**
 * Semver regex pattern
 */
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * VS Code engine version pattern (e.g., ^1.85.0, >=1.80.0, *)
 */
const VSCODE_ENGINE_PATTERN = /^(\*|\^|>=?|<=?|~)?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;

/**
 * npm package name pattern
 */
const NPM_NAME_PATTERN = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Service for validating VS Code extension manifests
 */
export class ValidationService {
  /**
   * Validate a complete manifest
   */
  public validate(manifest: VscodeManifest): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Required fields
    this.validateRequired(manifest, errors);

    // Field formats
    this.validateFormats(manifest, errors, warnings);

    // Categories
    this.validateCategories(manifest, errors);

    // Commands
    this.validateCommands(manifest, errors, warnings);

    // Configuration
    this.validateConfiguration(manifest, errors, warnings);

    // Activation events
    this.validateActivationEvents(manifest, errors, warnings, info);

    // Extension dependencies
    this.validateExtensionDependencies(manifest, warnings);

    // Best practices
    this.validateBestPractices(manifest, warnings, info);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate a single field
   */
  public validateField(
    field: string,
    value: unknown,
    manifest?: VscodeManifest
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (field) {
      case 'name':
        if (!this.isValidNpmName(value)) {
          errors.push({
            path: 'name',
            message:
              'Name must be lowercase and can only contain letters, numbers, hyphens, and underscores',
            severity: 'error',
          });
        }
        break;

      case 'version':
        if (!this.isValidSemver(value)) {
          errors.push({
            path: 'version',
            message: 'Version must be a valid semver (e.g., 1.0.0)',
            severity: 'error',
          });
        }
        break;

      case 'publisher':
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push({
            path: 'publisher',
            message: 'Publisher is required',
            severity: 'error',
          });
        }
        break;

      case 'engines.vscode':
        if (!this.isValidVscodeEngine(value)) {
          errors.push({
            path: 'engines.vscode',
            message:
              'engines.vscode must be a valid version range (e.g., ^1.85.0)',
            severity: 'error',
          });
        }
        break;

      case 'displayName':
        if (typeof value === 'string' && value.length > 200) {
          errors.push({
            path: 'displayName',
            message: 'Display name should be under 200 characters',
            severity: 'warning',
          });
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 500) {
          errors.push({
            path: 'description',
            message: 'Description should be under 500 characters for best display',
            severity: 'warning',
          });
        }
        break;
    }

    return errors;
  }

  // ============================================================================
  // Private validation methods
  // ============================================================================

  private validateRequired(
    manifest: VscodeManifest,
    errors: ValidationError[]
  ): void {
    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push({
        path: 'name',
        message: 'name is required',
        severity: 'error',
      });
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push({
        path: 'version',
        message: 'version is required',
        severity: 'error',
      });
    }

    if (!manifest.publisher || typeof manifest.publisher !== 'string') {
      errors.push({
        path: 'publisher',
        message: 'publisher is required for VS Code extensions',
        severity: 'error',
      });
    }

    if (!manifest.engines?.vscode) {
      errors.push({
        path: 'engines.vscode',
        message: 'engines.vscode is required for VS Code extensions',
        severity: 'error',
      });
    }
  }

  private validateFormats(
    manifest: VscodeManifest,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Name format
    if (manifest.name && !this.isValidNpmName(manifest.name)) {
      errors.push({
        path: 'name',
        message:
          'name must be lowercase and can only contain letters, numbers, hyphens, tildes, and underscores',
        severity: 'error',
      });
    }

    // Version format
    if (manifest.version && !this.isValidSemver(manifest.version)) {
      errors.push({
        path: 'version',
        message: 'version must be a valid semver (e.g., 1.0.0)',
        severity: 'error',
      });
    }

    // Engine version format
    if (manifest.engines?.vscode && !this.isValidVscodeEngine(manifest.engines.vscode)) {
      errors.push({
        path: 'engines.vscode',
        message:
          'engines.vscode must be a valid version range (e.g., ^1.85.0, >=1.80.0)',
        severity: 'error',
      });
    }

    // Icon path
    if (manifest.icon && !manifest.icon.match(/\.(png|PNG)$/)) {
      warnings.push({
        path: 'icon',
        message: 'icon should be a PNG file (128x128 pixels recommended)',
        severity: 'warning',
      });
    }

    // Gallery banner color
    if (
      manifest.galleryBanner?.color &&
      !manifest.galleryBanner.color.match(/^#[0-9A-Fa-f]{6}$/)
    ) {
      warnings.push({
        path: 'galleryBanner.color',
        message: 'galleryBanner.color should be a valid hex color (e.g., #FF0000)',
        severity: 'warning',
      });
    }
  }

  private validateCategories(
    manifest: VscodeManifest,
    errors: ValidationError[]
  ): void {
    if (!manifest.categories) {
      return;
    }

    for (let i = 0; i < manifest.categories.length; i++) {
      const category = manifest.categories[i];
      if (!VALID_CATEGORIES.includes(category)) {
        errors.push({
          path: `categories[${i}]`,
          message: `"${category}" is not a valid VS Code extension category`,
          severity: 'error',
        });
      }
    }
  }

  private validateCommands(
    manifest: VscodeManifest,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const commands = manifest.contributes?.commands;
    if (!commands) {
      return;
    }

    const commandIds = new Set<string>();

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      // Required fields
      if (!cmd.command) {
        errors.push({
          path: `contributes.commands[${i}].command`,
          message: 'command id is required',
          severity: 'error',
        });
      }

      if (!cmd.title) {
        errors.push({
          path: `contributes.commands[${i}].title`,
          message: 'command title is required',
          severity: 'error',
        });
      }

      // Duplicate check
      if (cmd.command && commandIds.has(cmd.command)) {
        warnings.push({
          path: `contributes.commands[${i}].command`,
          message: `Duplicate command id: ${cmd.command}`,
          severity: 'warning',
        });
      }
      if (cmd.command) {
        commandIds.add(cmd.command);
      }
    }
  }

  private validateConfiguration(
    manifest: VscodeManifest,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const config = manifest.contributes?.configuration;
    if (!config) {
      return;
    }

    const configs = Array.isArray(config) ? config : [config];

    for (let i = 0; i < configs.length; i++) {
      const cfg = configs[i];
      if (!cfg.properties) {
        continue;
      }

      for (const [key, prop] of Object.entries(cfg.properties)) {
        // Configuration key should be prefixed with extension name
        if (manifest.name && !key.startsWith(manifest.name + '.')) {
          warnings.push({
            path: `contributes.configuration.properties.${key}`,
            message: `Configuration key should be prefixed with extension name (e.g., ${manifest.name}.${key})`,
            severity: 'warning',
          });
        }

        // Default value should match type
        if (prop.default !== undefined && prop.type) {
          const defaultType = Array.isArray(prop.default)
            ? 'array'
            : typeof prop.default;
          const expectedTypes = Array.isArray(prop.type) ? prop.type : [prop.type];

          if (!expectedTypes.includes(defaultType as never)) {
            warnings.push({
              path: `contributes.configuration.properties.${key}.default`,
              message: `Default value type (${defaultType}) doesn't match declared type (${expectedTypes.join(' | ')})`,
              severity: 'warning',
            });
          }
        }
      }
    }
  }

  private validateActivationEvents(
    manifest: VscodeManifest,
    errors: ValidationError[],
    warnings: ValidationError[],
    info: ValidationError[]
  ): void {
    const events = manifest.activationEvents;
    if (!events || events.length === 0) {
      // With implicit activation, this is often fine
      if (manifest.contributes?.commands?.length) {
        info.push({
          path: 'activationEvents',
          message:
            'No activation events specified. Extension will use implicit activation from contributions.',
          severity: 'info',
        });
      }
      return;
    }

    const validPrefixes = [
      'onLanguage:',
      'onCommand:',
      'onDebug',
      'onDebugInitialConfigurations',
      'onDebugResolve:',
      'workspaceContains:',
      'onFileSystem:',
      'onView:',
      'onUri',
      'onWebviewPanel:',
      'onCustomEditor:',
      'onNotebook:',
      'onAuthenticationRequest:',
      'onStartupFinished',
      '*',
      'onWalkthrough:',
      'onSearch:',
      'onTerminalProfile:',
    ];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event === '*') {
        warnings.push({
          path: `activationEvents[${i}]`,
          message:
            'Using "*" activates the extension on startup which can impact VS Code performance',
          severity: 'warning',
        });
        continue;
      }

      const isValid = validPrefixes.some(
        (prefix) => event === prefix || event.startsWith(prefix)
      );

      if (!isValid) {
        errors.push({
          path: `activationEvents[${i}]`,
          message: `Invalid activation event: ${event}`,
          severity: 'error',
        });
      }
    }
  }

  private validateExtensionDependencies(
    manifest: VscodeManifest,
    warnings: ValidationError[]
  ): void {
    const deps = manifest.extensionDependencies;
    if (!deps) {
      return;
    }

    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      // Extension IDs should be in format: publisher.extensionName
      if (!dep.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/)) {
        warnings.push({
          path: `extensionDependencies[${i}]`,
          message: `Extension dependency "${dep}" should be in format: publisher.extensionName`,
          severity: 'warning',
        });
      }
    }
  }

  private validateBestPractices(
    manifest: VscodeManifest,
    warnings: ValidationError[],
    info: ValidationError[]
  ): void {
    // Missing displayName
    if (!manifest.displayName) {
      info.push({
        path: 'displayName',
        message: 'Consider adding a displayName for better marketplace visibility',
        severity: 'info',
      });
    }

    // Missing description
    if (!manifest.description) {
      warnings.push({
        path: 'description',
        message: 'Missing description. This is shown in the marketplace.',
        severity: 'warning',
      });
    }

    // Missing repository
    if (!manifest.repository) {
      info.push({
        path: 'repository',
        message: 'Consider adding a repository URL for open source projects',
        severity: 'info',
      });
    }

    // Missing icon
    if (!manifest.icon) {
      info.push({
        path: 'icon',
        message: 'Consider adding an icon for better marketplace visibility',
        severity: 'info',
      });
    }

    // Missing categories
    if (!manifest.categories || manifest.categories.length === 0) {
      info.push({
        path: 'categories',
        message: 'Consider adding categories to help users find your extension',
        severity: 'info',
      });
    }

    // Preview flag on version >= 1.0.0
    if (manifest.preview && manifest.version) {
      const majorVersion = parseInt(manifest.version.split('.')[0], 10);
      if (majorVersion >= 1) {
        info.push({
          path: 'preview',
          message:
            'Extension is marked as preview but version is >= 1.0.0. Consider removing preview flag.',
          severity: 'info',
        });
      }
    }
  }

  // ============================================================================
  // Helper methods
  // ============================================================================

  private isValidNpmName(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return NPM_NAME_PATTERN.test(value);
  }

  private isValidSemver(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return SEMVER_PATTERN.test(value);
  }

  private isValidVscodeEngine(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    if (value === '*') {
      return true;
    }
    return VSCODE_ENGINE_PATTERN.test(value);
  }
}
