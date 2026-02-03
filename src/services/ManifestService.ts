import { VscodeManifest } from '../models';

/**
 * Result of parsing a manifest
 */
export interface ParseResult {
  success: true;
  manifest: VscodeManifest;
  rawContent: string;
  /** Detected indentation (spaces or tabs) */
  indentation: string;
  /** Whether trailing newline was present */
  trailingNewline: boolean;
}

export interface ParseError {
  success: false;
  error: string;
  line?: number;
  column?: number;
}

export type ParseOutcome = ParseResult | ParseError;

/**
 * Detection result for VS Code extension package.json
 */
export interface ExtensionDetection {
  isExtension: boolean;
  hasEnginesVscode: boolean;
  hasContributes: boolean;
  hasActivationEvents: boolean;
  hasMain: boolean;
  hasBrowser: boolean;
}

/**
 * Service for parsing and serializing VS Code extension manifests.
 * Preserves non-extension fields and formatting during round-trips.
 */
export class ManifestService {
  /**
   * Parse a JSON string into a VscodeManifest
   */
  public parse(content: string): ParseOutcome {
    try {
      const manifest = JSON.parse(content) as VscodeManifest;

      // Detect indentation from the content
      const indentation = this.detectIndentation(content);

      // Check for trailing newline
      const trailingNewline = content.endsWith('\n');

      return {
        success: true,
        manifest,
        rawContent: content,
        indentation,
        trailingNewline,
      };
    } catch (error) {
      const parseError = this.parseJsonError(error, content);
      return {
        success: false,
        error: parseError.message,
        line: parseError.line,
        column: parseError.column,
      };
    }
  }

  /**
   * Serialize a VscodeManifest back to JSON string
   * Preserves formatting detected during parse
   */
  public serialize(
    manifest: VscodeManifest,
    options?: {
      indentation?: string;
      trailingNewline?: boolean;
    }
  ): string {
    const indent = options?.indentation ?? '  ';
    const trailing = options?.trailingNewline ?? true;

    let result = JSON.stringify(manifest, null, indent);

    if (trailing && !result.endsWith('\n')) {
      result += '\n';
    }

    return result;
  }

  /**
   * Update specific fields in a manifest while preserving all others
   * This is the key to non-destructive editing
   */
  public update(
    original: VscodeManifest,
    updates: Partial<VscodeManifest>
  ): VscodeManifest {
    // Create a shallow copy preserving all original keys
    const result = { ...original };

    // Apply updates, handling nested objects specially
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        // Remove the key if explicitly set to undefined
        delete result[key];
      } else if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
        // Merge nested objects
        result[key] = { ...(result[key] as object), ...value };
      } else {
        // Replace the value
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Detect if a package.json is a VS Code extension
   */
  public detectExtension(manifest: VscodeManifest): ExtensionDetection {
    const hasEnginesVscode = Boolean(manifest.engines?.vscode);
    const hasContributes =
      manifest.contributes !== undefined &&
      Object.keys(manifest.contributes).length > 0;
    const hasActivationEvents =
      Array.isArray(manifest.activationEvents) &&
      manifest.activationEvents.length > 0;
    const hasMain = Boolean(manifest.main);
    const hasBrowser = Boolean(manifest.browser);

    // Consider it an extension if it has engines.vscode OR contributes OR activationEvents
    const isExtension = hasEnginesVscode || hasContributes || hasActivationEvents;

    return {
      isExtension,
      hasEnginesVscode,
      hasContributes,
      hasActivationEvents,
      hasMain,
      hasBrowser,
    };
  }

  /**
   * Create a minimal VS Code extension manifest from an existing package.json
   */
  public initializeAsExtension(manifest: VscodeManifest): VscodeManifest {
    return this.update(manifest, {
      engines: {
        ...manifest.engines,
        vscode: '^1.85.0',
      },
      activationEvents: manifest.activationEvents ?? [],
      contributes: manifest.contributes ?? {},
    });
  }

  /**
   * Detect the indentation used in a JSON string
   */
  private detectIndentation(content: string): string {
    // Look for the first indented line
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip empty lines and the opening brace
      if (line.trim() === '' || line.trim() === '{' || line.trim() === '[') {
        continue;
      }

      // Check for leading whitespace
      const match = line.match(/^(\s+)/);
      if (match) {
        return match[1];
      }
    }

    // Default to 2 spaces
    return '  ';
  }

  /**
   * Parse JSON error to extract line and column information
   */
  private parseJsonError(
    error: unknown,
    content: string
  ): { message: string; line?: number; column?: number } {
    if (!(error instanceof SyntaxError)) {
      return { message: String(error) };
    }

    const message = error.message;

    // Try to extract position from error message
    // Format: "... at position X" or "... at line X column Y"
    const positionMatch = message.match(/at position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const { line, column } = this.positionToLineColumn(content, position);
      return { message, line, column };
    }

    const lineColMatch = message.match(/at line (\d+) column (\d+)/);
    if (lineColMatch) {
      return {
        message,
        line: parseInt(lineColMatch[1], 10),
        column: parseInt(lineColMatch[2], 10),
      };
    }

    return { message };
  }

  /**
   * Convert a character position to line and column numbers
   */
  private positionToLineColumn(
    content: string,
    position: number
  ): { line: number; column: number } {
    let line = 1;
    let column = 1;

    for (let i = 0; i < position && i < content.length; i++) {
      if (content[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return { line, column };
  }

  /**
   * Check if a value is a plain object (not array, null, etc.)
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === '[object Object]'
    );
  }
}
