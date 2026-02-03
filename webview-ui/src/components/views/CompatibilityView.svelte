<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  interface Capabilities {
    untrustedWorkspaces?: {
      supported: boolean | 'limited';
      description?: string;
      restrictedConfigurations?: string[];
    };
    virtualWorkspaces?: boolean | {
      supported: boolean | 'limited';
      description?: string;
    };
  }

  $: enginesVscode = $manifest?.engines?.vscode || '';
  $: extensionKind = ($manifest?.extensionKind as string[]) || [];
  $: capabilities = ($manifest?.capabilities as Capabilities) || {};

  $: untrustedSupport = capabilities.untrustedWorkspaces?.supported ?? true;
  $: untrustedDescription = capabilities.untrustedWorkspaces?.description || '';
  $: virtualSupport = typeof capabilities.virtualWorkspaces === 'boolean'
    ? capabilities.virtualWorkspaces
    : capabilities.virtualWorkspaces?.supported ?? true;
  $: virtualDescription = typeof capabilities.virtualWorkspaces === 'object'
    ? capabilities.virtualWorkspaces.description || ''
    : '';

  function handleEngineChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    const engines = { ...($manifest?.engines || {}), vscode: value };
    manifestStore.updateField('engines', engines);
  }

  function handleExtensionKindChange(kind: string, checked: boolean) {
    let newKind = [...extensionKind];
    if (checked && !newKind.includes(kind)) {
      newKind.push(kind);
    } else if (!checked) {
      newKind = newKind.filter((k) => k !== kind);
    }

    if (newKind.length > 0) {
      manifestStore.updateField('extensionKind', newKind);
    } else {
      manifestStore.updateField('extensionKind', undefined as unknown as string[]);
    }
  }

  function handleUiKindChange(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    handleExtensionKindChange('ui', checked);
  }

  function handleWorkspaceKindChange(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    handleExtensionKindChange('workspace', checked);
  }

  function handleUntrustedSupportChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    updateCapabilities('untrustedWorkspaces', 'supported', value === 'true' ? true : value === 'limited' ? 'limited' : false);
  }

  function handleUntrustedDescriptionChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    updateCapabilities('untrustedWorkspaces', 'description', value || undefined);
  }

  function handleVirtualSupportChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    const supported = value === 'true' ? true : value === 'limited' ? 'limited' : false;

    if (virtualDescription) {
      updateCapabilities('virtualWorkspaces', 'supported', supported);
    } else {
      // Simple boolean form
      const newCapabilities = { ...capabilities };
      if (supported === true) {
        delete newCapabilities.virtualWorkspaces;
      } else {
        newCapabilities.virtualWorkspaces = supported;
      }
      saveCapabilities(newCapabilities);
    }
  }

  function handleVirtualDescriptionChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      updateCapabilities('virtualWorkspaces', 'description', value);
    } else {
      // Convert back to boolean form
      const newCapabilities = { ...capabilities };
      if (typeof capabilities.virtualWorkspaces === 'object') {
        const supported = capabilities.virtualWorkspaces.supported;
        if (supported === true) {
          delete newCapabilities.virtualWorkspaces;
        } else {
          newCapabilities.virtualWorkspaces = supported;
        }
      }
      saveCapabilities(newCapabilities);
    }
  }

  function updateCapabilities(section: 'untrustedWorkspaces' | 'virtualWorkspaces', field: string, value: unknown) {
    const newCapabilities = { ...capabilities };

    if (section === 'untrustedWorkspaces') {
      newCapabilities.untrustedWorkspaces = {
        ...newCapabilities.untrustedWorkspaces,
        [field]: value,
      } as Capabilities['untrustedWorkspaces'];

      // Clean up undefined values
      if (!newCapabilities.untrustedWorkspaces?.description) {
        delete newCapabilities.untrustedWorkspaces?.description;
      }
      if (newCapabilities.untrustedWorkspaces?.supported === true && !newCapabilities.untrustedWorkspaces?.description) {
        delete newCapabilities.untrustedWorkspaces;
      }
    } else {
      if (field === 'supported' && !virtualDescription) {
        newCapabilities.virtualWorkspaces = value as boolean;
      } else {
        newCapabilities.virtualWorkspaces = {
          supported: virtualSupport,
          ...(typeof newCapabilities.virtualWorkspaces === 'object' ? newCapabilities.virtualWorkspaces : {}),
          [field]: value,
        } as Capabilities['virtualWorkspaces'];
      }

      // Clean up
      if (typeof newCapabilities.virtualWorkspaces === 'object') {
        if (!newCapabilities.virtualWorkspaces.description) {
          delete (newCapabilities.virtualWorkspaces as Record<string, unknown>).description;
        }
        if (newCapabilities.virtualWorkspaces.supported === true && !newCapabilities.virtualWorkspaces.description) {
          delete newCapabilities.virtualWorkspaces;
        }
      } else if (newCapabilities.virtualWorkspaces === true) {
        delete newCapabilities.virtualWorkspaces;
      }
    }

    saveCapabilities(newCapabilities);
  }

  function saveCapabilities(caps: Capabilities) {
    if (Object.keys(caps).length > 0) {
      manifestStore.updateField('capabilities', caps);
    } else {
      manifestStore.updateField('capabilities', undefined as unknown as Capabilities);
    }
  }
</script>

<div class="compatibility-view">
  <h1>Compatibility</h1>
  <p class="description">
    Configure VS Code version requirements, extension kind, and workspace capabilities.
  </p>

  <section class="card">
    <div class="card-header">VS Code Version</div>
    <div class="card-content">
      <div class="form-group">
        <label for="engines-vscode">engines.vscode</label>
        <input
          id="engines-vscode"
          type="text"
          value={enginesVscode}
          on:change={handleEngineChange}
          placeholder="^1.74.0"
        />
        <span class="field-hint">
          Minimum VS Code version required. Use semver range (e.g., ^1.74.0, >=1.70.0)
        </span>
      </div>

      <div class="version-examples">
        <span class="examples-label">Common patterns:</span>
        <code>^1.74.0</code> - 1.74.0 or higher (minor updates OK)
        <code>>=1.70.0</code> - 1.70.0 or higher (any version)
        <code>~1.74.0</code> - 1.74.x only (patch updates OK)
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Extension Kind</div>
    <div class="card-content">
      <p class="field-description">
        Specify where the extension can run. If not set, VS Code determines this automatically.
      </p>

      <div class="checkbox-group">
        <label class="checkbox-item">
          <input
            type="checkbox"
            checked={extensionKind.includes('ui')}
            on:change={handleUiKindChange}
          />
          <span class="checkbox-label">
            <strong>ui</strong> - Runs on the local machine (UI extensions)
          </span>
        </label>

        <label class="checkbox-item">
          <input
            type="checkbox"
            checked={extensionKind.includes('workspace')}
            on:change={handleWorkspaceKindChange}
          />
          <span class="checkbox-label">
            <strong>workspace</strong> - Runs on the remote machine (workspace extensions)
          </span>
        </label>
      </div>

      <div class="kind-hint">
        <strong>UI extensions</strong>: Access local resources, contribute UI elements<br />
        <strong>Workspace extensions</strong>: Access workspace files, run language servers
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Untrusted Workspaces</div>
    <div class="card-content">
      <div class="form-group">
        <label for="untrusted-support">Support Level</label>
        <select id="untrusted-support" value={String(untrustedSupport)} on:change={handleUntrustedSupportChange}>
          <option value="true">Supported - Full functionality in untrusted workspaces</option>
          <option value="limited">Limited - Restricted functionality in untrusted workspaces</option>
          <option value="false">Not Supported - Disabled in untrusted workspaces</option>
        </select>
      </div>

      {#if untrustedSupport !== true}
        <div class="form-group">
          <label for="untrusted-description">Description</label>
          <input
            id="untrusted-description"
            type="text"
            value={untrustedDescription}
            on:change={handleUntrustedDescriptionChange}
            placeholder="Explain why the extension is limited/disabled"
          />
          <span class="field-hint">Shown to users in untrusted workspaces</span>
        </div>
      {/if}
    </div>
  </section>

  <section class="card">
    <div class="card-header">Virtual Workspaces</div>
    <div class="card-content">
      <div class="form-group">
        <label for="virtual-support">Support Level</label>
        <select id="virtual-support" value={String(virtualSupport)} on:change={handleVirtualSupportChange}>
          <option value="true">Supported - Works in virtual workspaces (vscode.dev)</option>
          <option value="limited">Limited - Partial functionality in virtual workspaces</option>
          <option value="false">Not Supported - Disabled in virtual workspaces</option>
        </select>
      </div>

      {#if virtualSupport !== true}
        <div class="form-group">
          <label for="virtual-description">Description</label>
          <input
            id="virtual-description"
            type="text"
            value={virtualDescription}
            on:change={handleVirtualDescriptionChange}
            placeholder="Explain why the extension is limited/disabled"
          />
          <span class="field-hint">Shown to users in virtual workspaces</span>
        </div>
      {/if}
    </div>
  </section>

  <section class="help-section">
    <h3>About Workspace Trust</h3>
    <p>
      VS Code's Workspace Trust feature protects users from potentially malicious code.
      Extensions should declare their trust requirements to ensure proper behavior.
    </p>

    <h3>About Virtual Workspaces</h3>
    <p>
      Virtual workspaces (like vscode.dev) don't have direct file system access.
      Extensions that rely on local file operations may not work properly.
    </p>
  </section>
</div>

<style>
  .compatibility-view {
    padding: 20px;
    overflow-y: auto;
    height: 100%;
  }

  h1 {
    margin-bottom: 8px;
    font-size: 1.4em;
  }

  .description {
    color: var(--vscode-descriptionForeground);
    margin-bottom: 20px;
  }

  .card {
    margin-bottom: 20px;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
  }

  .card-header {
    padding: 12px 16px;
    font-weight: 600;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  .card-content {
    padding: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 6px 8px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    border-radius: 2px;
  }

  .form-group select {
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border-color: var(--vscode-dropdown-border, var(--vscode-panel-border));
  }

  .field-hint {
    display: block;
    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .field-description {
    margin-bottom: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .version-examples {
    margin-top: 12px;
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
  }

  .version-examples code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    margin-right: 4px;
  }

  .examples-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--vscode-foreground);
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox-item input {
    margin-top: 4px;
  }

  .checkbox-label {
    color: var(--vscode-foreground);
  }

  .checkbox-label strong {
    color: var(--vscode-foreground);
  }

  .kind-hint {
    margin-top: 12px;
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
    line-height: 1.6;
  }

  .help-section {
    padding: 16px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
  }

  .help-section h3 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 1em;
  }

  .help-section h3:first-child {
    margin-top: 0;
  }

  .help-section p {
    margin: 0;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
  }
</style>
