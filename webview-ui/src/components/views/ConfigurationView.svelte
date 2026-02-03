<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  interface ConfigurationProperty {
    type?: string | string[];
    default?: unknown;
    description?: string;
    markdownDescription?: string;
    enum?: unknown[];
    enumDescriptions?: string[];
    minimum?: number;
    maximum?: number;
    scope?: string;
    order?: number;
    deprecationMessage?: string;
  }

  interface Configuration {
    title?: string;
    properties?: Record<string, ConfigurationProperty>;
  }

  const PROPERTY_TYPES = ['string', 'boolean', 'number', 'integer', 'array', 'object', 'null'];
  const SCOPES = [
    { value: 'application', label: 'Application - All windows' },
    { value: 'machine', label: 'Machine - Specific machine' },
    { value: 'machine-overridable', label: 'Machine Overridable' },
    { value: 'window', label: 'Window - Current window' },
    { value: 'resource', label: 'Resource - Per folder/file' },
    { value: 'language-overridable', label: 'Language Overridable' },
  ];

  $: configuration = getConfiguration($manifest?.contributes?.configuration);
  $: properties = configuration?.properties || {};
  $: propertyKeys = Object.keys(properties).sort();

  function getConfiguration(config: unknown): Configuration | null {
    if (!config) return null;
    if (Array.isArray(config)) return config[0] as Configuration;
    return config as Configuration;
  }

  // Edit state
  let editingKey: string | null = null;
  let isAdding = false;

  // Form state
  let formKey = '';
  let formType: string = 'string';
  let formDefault = '';
  let formDescription = '';
  let formScope = 'window';
  let formEnum = '';
  let formEnumDescriptions = '';
  let formMinimum = '';
  let formMaximum = '';
  let formDeprecationMessage = '';

  function startAdd() {
    isAdding = true;
    editingKey = null;
    resetForm();
    // Pre-fill with extension name prefix
    const name = $manifest?.name || 'myExtension';
    formKey = `${name}.`;
  }

  function startEdit(key: string) {
    editingKey = key;
    isAdding = false;
    const prop = properties[key];
    formKey = key;
    formType = Array.isArray(prop.type) ? prop.type[0] || 'string' : prop.type || 'string';
    formDefault = formatDefaultValue(prop.default);
    formDescription = prop.description || prop.markdownDescription || '';
    formScope = prop.scope || 'window';
    formEnum = prop.enum ? prop.enum.join(', ') : '';
    formEnumDescriptions = prop.enumDescriptions ? prop.enumDescriptions.join('\n') : '';
    formMinimum = prop.minimum !== undefined ? String(prop.minimum) : '';
    formMaximum = prop.maximum !== undefined ? String(prop.maximum) : '';
    formDeprecationMessage = prop.deprecationMessage || '';
  }

  function resetForm() {
    formKey = '';
    formType = 'string';
    formDefault = '';
    formDescription = '';
    formScope = 'window';
    formEnum = '';
    formEnumDescriptions = '';
    formMinimum = '';
    formMaximum = '';
    formDeprecationMessage = '';
  }

  function cancelEdit() {
    editingKey = null;
    isAdding = false;
    resetForm();
  }

  function saveProperty() {
    if (!formKey.trim()) return;

    const prop: ConfigurationProperty = {
      type: formType,
      description: formDescription || undefined,
      scope: formScope,
    };

    // Parse default value based on type
    if (formDefault) {
      prop.default = parseDefaultValue(formDefault, formType);
    }

    // Parse enum values
    if (formEnum.trim()) {
      prop.enum = formEnum.split(',').map((s) => s.trim());
      if (formEnumDescriptions.trim()) {
        prop.enumDescriptions = formEnumDescriptions.split('\n').map((s) => s.trim());
      }
    }

    // Numeric constraints
    if (formType === 'number' || formType === 'integer') {
      if (formMinimum) prop.minimum = Number(formMinimum);
      if (formMaximum) prop.maximum = Number(formMaximum);
    }

    // Deprecation
    if (formDeprecationMessage.trim()) {
      prop.deprecationMessage = formDeprecationMessage;
    }

    const newProperties = { ...properties };

    // If editing and key changed, remove old key
    if (editingKey && editingKey !== formKey) {
      delete newProperties[editingKey];
    }

    newProperties[formKey] = prop;
    updateConfiguration(newProperties);
    cancelEdit();
  }

  function removeProperty(key: string) {
    const newProperties = { ...properties };
    delete newProperties[key];
    updateConfiguration(newProperties);
  }

  function updateConfiguration(newProperties: Record<string, ConfigurationProperty>) {
    const contributes = { ...($manifest?.contributes || {}) };

    if (Object.keys(newProperties).length > 0) {
      contributes.configuration = {
        title: configuration?.title || $manifest?.displayName || 'Extension Settings',
        properties: newProperties,
      };
    } else {
      delete contributes.configuration;
    }

    manifestStore.updateField('contributes', contributes);
  }

  function formatDefaultValue(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function parseDefaultValue(value: string, type: string): unknown {
    if (!value) return undefined;
    switch (type) {
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'number':
        return parseFloat(value);
      case 'integer':
        return parseInt(value, 10);
      case 'array':
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  function getTypeLabel(prop: ConfigurationProperty): string {
    if (Array.isArray(prop.type)) return prop.type.join(' | ');
    return prop.type || 'string';
  }
</script>

<div class="configuration-view">
  <h1>Configuration</h1>
  <p class="description">
    Define settings that users can configure for your extension.
  </p>

  <div class="config-layout">
    <!-- Properties List -->
    <section class="properties-list card">
      <div class="card-header">
        <span>Configuration Properties</span>
        {#if !isAdding && !editingKey}
          <button class="add-btn" on:click={startAdd}>+ Add Property</button>
        {/if}
      </div>

      {#if propertyKeys.length === 0 && !isAdding}
        <div class="empty-message">
          No configuration properties defined. Add a property to allow users to customize your extension.
        </div>
      {/if}

      <ul class="property-list">
        {#each propertyKeys as key}
          <li
            class="property-item"
            class:active={editingKey === key}
            class:deprecated={properties[key].deprecationMessage}
          >
            <button
              class="property-button"
              on:click={() => startEdit(key)}
              disabled={isAdding || (editingKey !== null && editingKey !== key)}
            >
              <div class="property-info">
                <span class="property-key">{key}</span>
                <span class="property-type">{getTypeLabel(properties[key])}</span>
              </div>
              {#if properties[key].description}
                <div class="property-description">{properties[key].description}</div>
              {/if}
            </button>
            <button
              class="remove-btn"
              on:click|stopPropagation={() => removeProperty(key)}
              disabled={isAdding || editingKey !== null}
              title="Remove property"
            >
              🗑
            </button>
          </li>
        {/each}
      </ul>
    </section>

    <!-- Property Editor -->
    {#if isAdding || editingKey}
      <section class="property-editor card">
        <div class="card-header">
          {isAdding ? 'Add Property' : 'Edit Property'}
        </div>

        <form on:submit|preventDefault={saveProperty}>
          <div class="form-group">
            <label for="prop-key">Property Key *</label>
            <input
              type="text"
              id="prop-key"
              bind:value={formKey}
              placeholder="myExtension.settingName"
              required
            />
            <div class="help-text">Should be prefixed with your extension name</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="prop-type">Type</label>
              <select id="prop-type" bind:value={formType}>
                {#each PROPERTY_TYPES as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="prop-scope">Scope</label>
              <select id="prop-scope" bind:value={formScope}>
                {#each SCOPES as scope}
                  <option value={scope.value}>{scope.label}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="prop-default">Default Value</label>
            <input
              type="text"
              id="prop-default"
              bind:value={formDefault}
              placeholder={formType === 'boolean' ? 'true or false' : formType === 'array' ? '["item1", "item2"]' : ''}
            />
          </div>

          <div class="form-group">
            <label for="prop-description">Description</label>
            <textarea
              id="prop-description"
              bind:value={formDescription}
              placeholder="Describe what this setting does..."
              rows="2"
            ></textarea>
          </div>

          {#if formType === 'string'}
            <div class="form-group">
              <label for="prop-enum">Enum Values (comma-separated)</label>
              <input
                type="text"
                id="prop-enum"
                bind:value={formEnum}
                placeholder="option1, option2, option3"
              />
            </div>

            {#if formEnum}
              <div class="form-group">
                <label for="prop-enum-desc">Enum Descriptions (one per line)</label>
                <textarea
                  id="prop-enum-desc"
                  bind:value={formEnumDescriptions}
                  placeholder="Description for option1&#10;Description for option2"
                  rows="3"
                ></textarea>
              </div>
            {/if}
          {/if}

          {#if formType === 'number' || formType === 'integer'}
            <div class="form-row">
              <div class="form-group">
                <label for="prop-min">Minimum</label>
                <input type="number" id="prop-min" bind:value={formMinimum} />
              </div>
              <div class="form-group">
                <label for="prop-max">Maximum</label>
                <input type="number" id="prop-max" bind:value={formMaximum} />
              </div>
            </div>
          {/if}

          <div class="form-group">
            <label for="prop-deprecated">Deprecation Message</label>
            <input
              type="text"
              id="prop-deprecated"
              bind:value={formDeprecationMessage}
              placeholder="This setting is deprecated, use X instead"
            />
            <div class="help-text">Leave empty if not deprecated</div>
          </div>

          <div class="form-actions">
            <button type="submit" class="primary">
              {isAdding ? 'Add Property' : 'Save Changes'}
            </button>
            <button type="button" class="secondary" on:click={cancelEdit}>Cancel</button>
          </div>
        </form>
      </section>
    {:else}
      <section class="help-section card">
        <div class="card-header">Configuration Help</div>
        <p>
          Configuration properties allow users to customize your extension's behavior through VS Code's Settings UI.
        </p>

        <h4>Property Naming</h4>
        <p>
          Always prefix your property keys with your extension name to avoid conflicts:
          <code>myExtension.settingName</code>
        </p>

        <h4>Scopes</h4>
        <ul>
          <li><strong>Application</strong> - Applies to all VS Code windows</li>
          <li><strong>Window</strong> - Applies to the current window (default)</li>
          <li><strong>Resource</strong> - Can differ per folder or file</li>
          <li><strong>Language Overridable</strong> - Can differ per language</li>
        </ul>

        <h4>Reading Settings in Code</h4>
        <pre><code>const config = vscode.workspace.getConfiguration('myExtension');
const value = config.get('settingName');</code></pre>
      </section>
    {/if}
  </div>
</div>

<style>
  .configuration-view {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  h1 {
    margin-bottom: 8px;
    font-size: 1.4em;
    flex-shrink: 0;
  }

  .description {
    color: var(--vscode-descriptionForeground);
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .config-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .properties-list {
    overflow: hidden;
  }

  .property-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .property-item {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  .property-item:last-child {
    border-bottom: none;
  }

  .property-item.deprecated {
    opacity: 0.6;
  }

  .property-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .property-button:hover:not(:disabled) {
    background-color: var(--vscode-list-hoverBackground);
  }

  .property-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .property-item.active .property-button {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }

  .property-info {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: 100%;
  }

  .property-key {
    font-family: var(--vscode-editor-font-family, monospace);
    font-weight: 600;
  }

  .property-type {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .property-item.active .property-type {
    color: inherit;
    opacity: 0.8;
  }

  .property-description {
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .property-item.active .property-description {
    color: inherit;
    opacity: 0.8;
  }

  .remove-btn {
    padding: 0 12px;
    background: none;
    border: none;
    border-left: 1px solid var(--vscode-panel-border);
    color: var(--vscode-errorForeground);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .property-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:disabled {
    cursor: not-allowed;
  }

  .empty-message {
    padding: 24px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }

  .add-btn {
    background: transparent;
    color: var(--vscode-textLink-foreground);
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 0.9em;
  }

  .add-btn:hover {
    text-decoration: underline;
  }

  .property-editor {
    overflow-y: auto;
  }

  .property-editor form {
    padding: 16px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--vscode-panel-border);
  }

  button.primary {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }

  button.secondary {
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }

  .help-section {
    overflow-y: auto;
  }

  .help-section p {
    margin: 12px 16px;
    color: var(--vscode-descriptionForeground);
  }

  .help-section h4 {
    margin: 16px 16px 8px;
    font-size: 0.95em;
  }

  .help-section ul {
    margin: 8px 16px;
    padding-left: 20px;
  }

  .help-section li {
    margin: 4px 0;
    color: var(--vscode-descriptionForeground);
  }

  .help-section pre {
    margin: 8px 16px;
    padding: 12px;
    background-color: var(--vscode-textCodeBlock-background);
    border-radius: 4px;
    overflow-x: auto;
  }

  code {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  .help-text {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    margin-top: 4px;
  }
</style>
