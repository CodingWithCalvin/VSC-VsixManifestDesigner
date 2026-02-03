/**
 * VS Code Extension Manifest (package.json) TypeScript Interfaces
 */

// ============================================================================
// Core Manifest Interface
// ============================================================================

export interface VscodeManifest {
  // Required fields
  name: string;
  version: string;
  publisher: string;
  engines: Engines;

  // Display information
  displayName?: string;
  description?: string;
  icon?: string;
  preview?: boolean;

  // Categories and keywords
  categories?: Category[];
  keywords?: string[];

  // Repository and links
  repository?: Repository | string;
  bugs?: Bugs | string;
  homepage?: string;
  license?: string;

  // Marketplace
  galleryBanner?: GalleryBanner;
  badges?: Badge[];
  markdown?: 'github' | 'standard';
  qna?: 'marketplace' | string | false;
  sponsor?: Sponsor;

  // Extension behavior
  main?: string;
  browser?: string;
  activationEvents?: string[];
  contributes?: Contributes;
  extensionPack?: string[];
  extensionDependencies?: string[];
  extensionKind?: ExtensionKind[];

  // Capabilities
  capabilities?: Capabilities;

  // Pricing (for paid extensions)
  pricing?: 'Free' | 'Trial';

  // Scripts (npm scripts)
  scripts?: Record<string, string>;

  // Dependencies (npm)
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;

  // Allow additional fields for non-extension package.json properties
  [key: string]: unknown;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface Engines {
  vscode: string;
  [key: string]: string | undefined;
}

export type Category =
  | 'Azure'
  | 'Data Science'
  | 'Debuggers'
  | 'Education'
  | 'Extension Packs'
  | 'Formatters'
  | 'Keymaps'
  | 'Language Packs'
  | 'Linters'
  | 'Machine Learning'
  | 'Notebooks'
  | 'Other'
  | 'Programming Languages'
  | 'SCM Providers'
  | 'Snippets'
  | 'Testing'
  | 'Themes'
  | 'Visualization';

export type ExtensionKind = 'ui' | 'workspace' | 'web';

export interface Repository {
  type?: string;
  url: string;
  directory?: string;
}

export interface Bugs {
  url?: string;
  email?: string;
}

export interface GalleryBanner {
  color?: string;
  theme?: 'dark' | 'light';
}

export interface Badge {
  url: string;
  href: string;
  description: string;
}

export interface Sponsor {
  url: string;
}

export interface Capabilities {
  untrustedWorkspaces?: UntrustedWorkspacesCapability;
  virtualWorkspaces?: VirtualWorkspacesCapability;
}

export interface UntrustedWorkspacesCapability {
  supported: boolean | 'limited';
  description?: string;
  restrictedConfigurations?: string[];
}

export interface VirtualWorkspacesCapability {
  supported: boolean | 'limited';
  description?: string;
}

// ============================================================================
// Contributions
// ============================================================================

export interface Contributes {
  commands?: Command[];
  configuration?: Configuration | Configuration[];
  configurationDefaults?: Record<string, unknown>;
  menus?: Menus;
  keybindings?: Keybinding[];
  languages?: Language[];
  grammars?: Grammar[];
  themes?: Theme[];
  iconThemes?: IconTheme[];
  productIconThemes?: ProductIconTheme[];
  snippets?: Snippet[];
  views?: Views;
  viewsContainers?: ViewsContainers;
  viewsWelcome?: ViewWelcome[];
  problemMatchers?: ProblemMatcher[];
  problemPatterns?: ProblemPattern[];
  taskDefinitions?: TaskDefinition[];
  colors?: Color[];
  typescriptServerPlugins?: TypescriptServerPlugin[];
  resourceLabelFormatters?: ResourceLabelFormatter[];
  customEditors?: CustomEditor[];
  notebooks?: NotebookType[];
  notebookRenderer?: NotebookRenderer[];
  terminal?: TerminalContribution;
  walkthroughs?: Walkthrough[];
  debuggers?: Debugger[];
  breakpoints?: Breakpoint[];
  semanticTokenTypes?: SemanticTokenType[];
  semanticTokenModifiers?: SemanticTokenModifier[];
  semanticTokenScopes?: SemanticTokenScope[];
  icons?: Record<string, IconDefinition>;
  submenus?: Submenu[];
  authentication?: AuthenticationProvider[];
  localizations?: Localization[];
  [key: string]: unknown;
}

// ============================================================================
// Commands
// ============================================================================

export interface Command {
  command: string;
  title: string;
  shortTitle?: string;
  category?: string;
  icon?: string | { light: string; dark: string };
  enablement?: string;
}

// ============================================================================
// Configuration
// ============================================================================

export interface Configuration {
  id?: string;
  title?: string;
  order?: number;
  properties?: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type?: ConfigurationPropertyType | ConfigurationPropertyType[];
  default?: unknown;
  description?: string;
  markdownDescription?: string;
  enum?: (string | number | boolean | null)[];
  enumDescriptions?: string[];
  markdownEnumDescriptions?: string[];
  enumItemLabels?: string[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  patternErrorMessage?: string;
  format?: string;
  deprecationMessage?: string;
  markdownDeprecationMessage?: string;
  editPresentation?: 'singlelineText' | 'multilineText';
  order?: number;
  scope?: ConfigurationScope;
  items?: ConfigurationPropertyItems;
  additionalProperties?: boolean | ConfigurationProperty;
  properties?: Record<string, ConfigurationProperty>;
  required?: string[];
  uniqueItems?: boolean;
}

export type ConfigurationPropertyType =
  | 'string'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'array'
  | 'object'
  | 'null';

export type ConfigurationScope =
  | 'application'
  | 'machine'
  | 'machine-overridable'
  | 'window'
  | 'resource'
  | 'language-overridable';

export interface ConfigurationPropertyItems {
  type?: ConfigurationPropertyType;
  enum?: (string | number | boolean | null)[];
  properties?: Record<string, ConfigurationProperty>;
}

// ============================================================================
// Menus
// ============================================================================

export interface Menus {
  commandPalette?: MenuItem[];
  'editor/title'?: MenuItem[];
  'editor/title/context'?: MenuItem[];
  'editor/title/run'?: MenuItem[];
  'editor/context'?: MenuItem[];
  'editor/lineNumber/context'?: MenuItem[];
  'explorer/context'?: MenuItem[];
  'scm/title'?: MenuItem[];
  'scm/sourceControl'?: MenuItem[];
  'scm/resourceGroup/context'?: MenuItem[];
  'scm/resourceState/context'?: MenuItem[];
  'scm/resourceFolder/context'?: MenuItem[];
  'scm/change/title'?: MenuItem[];
  'view/title'?: MenuItem[];
  'view/item/context'?: MenuItem[];
  'debug/callstack/context'?: MenuItem[];
  'debug/variables/context'?: MenuItem[];
  'debug/toolBar'?: MenuItem[];
  'notebook/toolbar'?: MenuItem[];
  'notebook/cell/title'?: MenuItem[];
  'notebook/cell/execute'?: MenuItem[];
  'interactive/toolbar'?: MenuItem[];
  'testing/item/context'?: MenuItem[];
  'testing/item/gutter'?: MenuItem[];
  'terminal/title/context'?: MenuItem[];
  'terminal/context'?: MenuItem[];
  'timeline/title'?: MenuItem[];
  'timeline/item/context'?: MenuItem[];
  'extension/context'?: MenuItem[];
  'webview/context'?: MenuItem[];
  'file/newFile'?: MenuItem[];
  'comments/comment/title'?: MenuItem[];
  'comments/comment/context'?: MenuItem[];
  'comments/commentThread/title'?: MenuItem[];
  'comments/commentThread/context'?: MenuItem[];
  [key: string]: MenuItem[] | undefined;
}

export interface MenuItem {
  command?: string;
  submenu?: string;
  when?: string;
  group?: string;
  alt?: string;
}

// ============================================================================
// Keybindings
// ============================================================================

export interface Keybinding {
  command: string;
  key: string;
  mac?: string;
  linux?: string;
  win?: string;
  when?: string;
  args?: unknown;
}

// ============================================================================
// Languages
// ============================================================================

export interface Language {
  id: string;
  aliases?: string[];
  extensions?: string[];
  filenames?: string[];
  filenamePatterns?: string[];
  firstLine?: string;
  configuration?: string;
  mimetypes?: string[];
  icon?: { light: string; dark: string };
}

// ============================================================================
// Grammars
// ============================================================================

export interface Grammar {
  language?: string;
  scopeName: string;
  path: string;
  embeddedLanguages?: Record<string, string>;
  tokenTypes?: Record<string, string>;
  injectTo?: string[];
  balancedBracketScopes?: string[];
  unbalancedBracketScopes?: string[];
}

// ============================================================================
// Themes
// ============================================================================

export interface Theme {
  id?: string;
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  path: string;
}

export interface IconTheme {
  id: string;
  label: string;
  path: string;
}

export interface ProductIconTheme {
  id: string;
  label: string;
  path: string;
}

// ============================================================================
// Snippets
// ============================================================================

export interface Snippet {
  language?: string;
  path: string;
}

// ============================================================================
// Views
// ============================================================================

export interface Views {
  explorer?: View[];
  scm?: View[];
  debug?: View[];
  test?: View[];
  [key: string]: View[] | undefined;
}

export interface View {
  id: string;
  name: string;
  when?: string;
  icon?: string;
  contextualTitle?: string;
  visibility?: 'visible' | 'hidden' | 'collapsed';
  initialSize?: number;
  type?: 'tree' | 'webview';
}

export interface ViewsContainers {
  activitybar?: ViewContainer[];
  panel?: ViewContainer[];
}

export interface ViewContainer {
  id: string;
  title: string;
  icon: string;
}

export interface ViewWelcome {
  view: string;
  contents: string;
  when?: string;
  group?: string;
  enablement?: string;
}

// ============================================================================
// Problem Matchers
// ============================================================================

export interface ProblemMatcher {
  name?: string;
  label?: string;
  owner?: string;
  source?: string;
  applyTo?: 'allDocuments' | 'openDocuments' | 'closedDocuments';
  fileLocation?: string | string[];
  pattern?: ProblemPattern | ProblemPattern[] | string;
  severity?: 'error' | 'warning' | 'info';
  background?: ProblemMatcherBackground;
}

export interface ProblemMatcherBackground {
  activeOnStart?: boolean;
  beginsPattern?: string | { regexp: string };
  endsPattern?: string | { regexp: string };
}

export interface ProblemPattern {
  name?: string;
  regexp: string;
  file?: number;
  location?: number;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  severity?: number;
  code?: number;
  message?: number;
  loop?: boolean;
}

// ============================================================================
// Tasks
// ============================================================================

export interface TaskDefinition {
  type: string;
  required?: string[];
  properties?: Record<string, ConfigurationProperty>;
  when?: string;
}

// ============================================================================
// Colors
// ============================================================================

export interface Color {
  id: string;
  description: string;
  defaults: {
    dark: string;
    light: string;
    highContrast?: string;
    highContrastLight?: string;
  };
}

// ============================================================================
// TypeScript Server Plugins
// ============================================================================

export interface TypescriptServerPlugin {
  name: string;
  enableForWorkspaceTypeScriptVersions?: boolean;
  languages?: string[];
  configNamespace?: string;
}

// ============================================================================
// Resource Label Formatters
// ============================================================================

export interface ResourceLabelFormatter {
  scheme: string;
  authority?: string;
  formatting: {
    label?: string;
    separator?: string;
    stripPathStartingSeparator?: boolean;
    tildify?: boolean;
    workspaceSuffix?: string;
  };
}

// ============================================================================
// Custom Editors
// ============================================================================

export interface CustomEditor {
  viewType: string;
  displayName: string;
  selector: CustomEditorSelector[];
  priority?: 'default' | 'option';
}

export interface CustomEditorSelector {
  filenamePattern?: string;
}

// ============================================================================
// Notebooks
// ============================================================================

export interface NotebookType {
  type: string;
  displayName: string;
  selector?: NotebookSelector[];
  priority?: 'default' | 'option';
}

export interface NotebookSelector {
  filenamePattern?: string;
  excludeFileNamePattern?: string;
}

export interface NotebookRenderer {
  id: string;
  displayName: string;
  entrypoint: string;
  mimeTypes: string[];
  requiresMessaging?: 'always' | 'optional' | 'never';
}

// ============================================================================
// Terminal
// ============================================================================

export interface TerminalContribution {
  profiles?: TerminalProfile[];
  quickFixes?: TerminalQuickFix[];
}

export interface TerminalProfile {
  id: string;
  title: string;
  icon?: string;
}

export interface TerminalQuickFix {
  id: string;
  commandLineMatcher: string;
  outputMatcher?: {
    anchor: 'top' | 'bottom';
    offset: number;
    length: number;
    lineMatcher: string;
  };
  commandExitResult: 'success' | 'error';
}

// ============================================================================
// Walkthroughs
// ============================================================================

export interface Walkthrough {
  id: string;
  title: string;
  description: string;
  steps: WalkthroughStep[];
  featuredFor?: string[];
  when?: string;
  icon?: string;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  media:
    | { image: string | { dark: string; light: string }; altText: string }
    | { markdown: string }
    | { svg: string };
  completionEvents?: string[];
  when?: string;
}

// ============================================================================
// Debuggers
// ============================================================================

export interface Debugger {
  type: string;
  label?: string;
  program?: string;
  runtime?: string;
  runtimeArgs?: string[];
  variables?: Record<string, string>;
  initialConfigurations?: DebugConfiguration[];
  configurationAttributes?: Record<string, ConfigurationProperty>;
  configurationSnippets?: DebugConfigurationSnippet[];
  languages?: string[];
  when?: string;
}

export interface DebugConfiguration {
  name: string;
  type: string;
  request: 'launch' | 'attach';
  [key: string]: unknown;
}

export interface DebugConfigurationSnippet {
  label: string;
  description?: string;
  body: DebugConfiguration;
}

export interface Breakpoint {
  language: string;
}

// ============================================================================
// Semantic Tokens
// ============================================================================

export interface SemanticTokenType {
  id: string;
  superType?: string;
  description?: string;
}

export interface SemanticTokenModifier {
  id: string;
  description?: string;
}

export interface SemanticTokenScope {
  scopes?: Record<string, string[]>;
  language?: string;
}

// ============================================================================
// Icons
// ============================================================================

export interface IconDefinition {
  description: string;
  default: {
    fontPath: string;
    fontCharacter: string;
  };
}

// ============================================================================
// Submenus
// ============================================================================

export interface Submenu {
  id: string;
  label: string;
  icon?: string | { light: string; dark: string };
}

// ============================================================================
// Authentication
// ============================================================================

export interface AuthenticationProvider {
  id: string;
  label: string;
}

// ============================================================================
// Localizations
// ============================================================================

export interface Localization {
  languageId: string;
  languageName?: string;
  localizedLanguageName?: string;
  translations: LocalizationTranslation[];
}

export interface LocalizationTranslation {
  id: string;
  path: string;
}
