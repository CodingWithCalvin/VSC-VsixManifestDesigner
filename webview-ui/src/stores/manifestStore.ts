import { writable, derived, get } from 'svelte/store';

// Types matching the extension's models
export interface VscodeManifest {
  name: string;
  version: string;
  publisher: string;
  displayName?: string;
  description?: string;
  icon?: string;
  preview?: boolean;
  categories?: string[];
  keywords?: string[];
  galleryBanner?: {
    color?: string;
    theme?: 'dark' | 'light';
  };
  engines: {
    vscode: string;
    [key: string]: string | undefined;
  };
  repository?: { type?: string; url: string } | string;
  license?: string;
  main?: string;
  browser?: string;
  activationEvents?: string[];
  contributes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ExtensionDetection {
  isExtension: boolean;
  hasEnginesVscode: boolean;
  hasContributes: boolean;
  hasActivationEvents: boolean;
  hasMain: boolean;
  hasBrowser: boolean;
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ManifestState {
  manifest: VscodeManifest | null;
  detection: ExtensionDetection | null;
  validation: ValidationResult | null;
  rawContent: string;
  parseError: { error: string; line?: number; column?: number } | null;
  isLoading: boolean;
}

// Initial state
const initialState: ManifestState = {
  manifest: null,
  detection: null,
  validation: null,
  rawContent: '',
  parseError: null,
  isLoading: true,
};

// Create the store
function createManifestStore() {
  const { subscribe, set, update } = writable<ManifestState>(initialState);

  return {
    subscribe,

    // Update with parsed manifest data from extension
    setManifest(
      manifest: VscodeManifest,
      detection: ExtensionDetection,
      validation: ValidationResult,
      rawContent: string
    ) {
      update((state) => ({
        ...state,
        manifest,
        detection,
        validation,
        rawContent,
        parseError: null,
        isLoading: false,
      }));
    },

    // Set parse error
    setParseError(error: string, line?: number, column?: number) {
      update((state) => ({
        ...state,
        manifest: null,
        detection: null,
        validation: null,
        parseError: { error, line, column },
        isLoading: false,
      }));
    },

    // Update a specific field in the manifest
    updateField<K extends keyof VscodeManifest>(field: K, value: VscodeManifest[K]) {
      const state = get({ subscribe });
      if (!state.manifest) return;

      // Send message to extension to update
      postMessage({
        type: 'updateManifest',
        updates: { [field]: value },
      });
    },

    // Update nested field (e.g., 'galleryBanner.color')
    updateNestedField(path: string, value: unknown) {
      const state = get({ subscribe });
      if (!state.manifest) return;

      const parts = path.split('.');
      const updates: Record<string, unknown> = {};

      if (parts.length === 1) {
        updates[parts[0]] = value;
      } else if (parts.length === 2) {
        const [parent, child] = parts;
        const currentParent = (state.manifest as Record<string, unknown>)[parent] as Record<string, unknown> | undefined;
        updates[parent] = {
          ...currentParent,
          [child]: value,
        };
      }

      postMessage({
        type: 'updateManifest',
        updates,
      });
    },

    // Reset to loading state
    setLoading() {
      update((state) => ({
        ...state,
        isLoading: true,
      }));
    },

    // Reset store
    reset() {
      set(initialState);
    },
  };
}

export const manifestStore = createManifestStore();

// Derived stores for convenience
export const manifest = derived(manifestStore, ($store) => $store.manifest);
export const validation = derived(manifestStore, ($store) => $store.validation);
export const isExtension = derived(manifestStore, ($store) => $store.detection?.isExtension ?? false);
export const isLoading = derived(manifestStore, ($store) => $store.isLoading);
export const parseError = derived(manifestStore, ($store) => $store.parseError);

// VS Code API type
interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

// VS Code API singleton
let vscodeApi: VsCodeApi | null = null;

export function getVsCodeApi(): VsCodeApi {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

// Post message to extension
export function postMessage(message: unknown) {
  getVsCodeApi().postMessage(message);
}

// File picker helper
export function pickFile(
  field: string,
  filters?: Record<string, string[]>
): void {
  postMessage({
    type: 'pickFile',
    field,
    filters,
  });
}

// File picker result store
export interface FilePickerResult {
  field: string;
  path: string;
}

const filePickerResultStore = writable<FilePickerResult | null>(null);

export const filePickerResult = {
  subscribe: filePickerResultStore.subscribe,
  set: (result: FilePickerResult) => filePickerResultStore.set(result),
  clear: () => filePickerResultStore.set(null),
};

// Navigation store
export type ViewType =
  | 'metadata'
  | 'activation'
  | 'compatibility'
  | 'dependencies'
  | 'documentation'
  | 'commands'
  | 'configuration'
  | 'menus'
  | 'keybindings'
  | 'viewContainers'
  | 'views'
  | 'languages'
  | 'grammars'
  | 'themes'
  | 'snippets'
  | 'advanced';

function createNavigationStore() {
  const { subscribe, set } = writable<ViewType>('metadata');

  return {
    subscribe,
    setView(view: ViewType) {
      set(view);
    },
  };
}

export const navigationStore = createNavigationStore();
export const currentView = derived(navigationStore, ($nav) => $nav);
