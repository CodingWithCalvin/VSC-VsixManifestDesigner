<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  $: extensionDependencies = ($manifest?.extensionDependencies as string[]) || [];
  $: extensionPack = ($manifest?.extensionPack as string[]) || [];

  let newDependency = '';
  let newPackItem = '';

  function handleAddDependency() {
    if (!newDependency.trim()) return;
    const dep = newDependency.trim();
    if (extensionDependencies.includes(dep)) return;

    const newDeps = [...extensionDependencies, dep];
    manifestStore.updateField('extensionDependencies', newDeps);
    newDependency = '';
  }

  function handleRemoveDependency(dep: string) {
    const newDeps = extensionDependencies.filter((d) => d !== dep);
    if (newDeps.length > 0) {
      manifestStore.updateField('extensionDependencies', newDeps);
    } else {
      manifestStore.updateField('extensionDependencies', undefined as unknown as string[]);
    }
  }

  function handleAddPackItem() {
    if (!newPackItem.trim()) return;
    const item = newPackItem.trim();
    if (extensionPack.includes(item)) return;

    const newPack = [...extensionPack, item];
    manifestStore.updateField('extensionPack', newPack);
    newPackItem = '';
  }

  function handleRemovePackItem(item: string) {
    const newPack = extensionPack.filter((i) => i !== item);
    if (newPack.length > 0) {
      manifestStore.updateField('extensionPack', newPack);
    } else {
      manifestStore.updateField('extensionPack', undefined as unknown as string[]);
    }
  }

  function validateExtensionId(id: string): boolean {
    // Extension IDs should be in format: publisher.extensionName
    return /^[\w-]+\.[\w-]+$/.test(id);
  }
</script>

<div class="dependencies-view">
  <h1>Dependencies</h1>
  <p class="description">
    Manage extension dependencies and create extension packs.
  </p>

  <section class="card">
    <div class="card-header">Extension Dependencies</div>
    <div class="card-content">
      <p class="section-description">
        Extensions that must be installed for this extension to work. VS Code will prompt users
        to install these automatically.
      </p>

      <div class="items-list">
        {#if extensionDependencies.length === 0}
          <p class="empty-message">No dependencies defined.</p>
        {:else}
          {#each extensionDependencies as dep}
            <div class="item">
              <code class="item-id">{dep}</code>
              <button class="remove-btn" on:click={() => handleRemoveDependency(dep)} title="Remove">×</button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="add-section">
        <label for="new-dependency">Add Dependency</label>
        <div class="input-row">
          <input
            id="new-dependency"
            type="text"
            bind:value={newDependency}
            placeholder="publisher.extensionName"
            on:keydown={(e) => e.key === 'Enter' && handleAddDependency()}
          />
          <button
            class="add-btn"
            on:click={handleAddDependency}
            disabled={!newDependency.trim() || !validateExtensionId(newDependency.trim())}
          >
            Add
          </button>
        </div>
        {#if newDependency && !validateExtensionId(newDependency)}
          <span class="validation-error">Use format: publisher.extensionName</span>
        {/if}
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Extension Pack</div>
    <div class="card-content">
      <p class="section-description">
        Create an extension pack that bundles multiple extensions together. When users install
        this extension, all pack members are installed automatically.
      </p>

      <div class="items-list">
        {#if extensionPack.length === 0}
          <p class="empty-message">No extensions in pack.</p>
        {:else}
          {#each extensionPack as item}
            <div class="item">
              <code class="item-id">{item}</code>
              <button class="remove-btn" on:click={() => handleRemovePackItem(item)} title="Remove">×</button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="add-section">
        <label for="new-pack-item">Add to Pack</label>
        <div class="input-row">
          <input
            id="new-pack-item"
            type="text"
            bind:value={newPackItem}
            placeholder="publisher.extensionName"
            on:keydown={(e) => e.key === 'Enter' && handleAddPackItem()}
          />
          <button
            class="add-btn"
            on:click={handleAddPackItem}
            disabled={!newPackItem.trim() || !validateExtensionId(newPackItem.trim())}
          >
            Add
          </button>
        </div>
        {#if newPackItem && !validateExtensionId(newPackItem)}
          <span class="validation-error">Use format: publisher.extensionName</span>
        {/if}
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3>Extension ID Format</h3>
    <p>
      Extension IDs use the format <code>publisher.extensionName</code>. You can find an extension's
      ID on its Marketplace page or in its package.json.
    </p>

    <h3>Dependencies vs Extension Pack</h3>
    <dl>
      <dt>Dependencies</dt>
      <dd>
        Required extensions that your extension needs to function. Users must install these,
        but they appear as separate extensions.
      </dd>

      <dt>Extension Pack</dt>
      <dd>
        A curated collection of extensions installed together. Use this to bundle related
        extensions (e.g., a language support pack with linter, formatter, and snippets).
      </dd>
    </dl>

    <h3>Popular Extensions</h3>
    <ul>
      <li><code>vscode.git</code> - Built-in Git support</li>
      <li><code>vscode.typescript-language-features</code> - TypeScript support</li>
      <li><code>ms-vscode.vscode-typescript-next</code> - TypeScript nightly</li>
      <li><code>esbenp.prettier-vscode</code> - Prettier formatter</li>
      <li><code>dbaeumer.vscode-eslint</code> - ESLint integration</li>
    </ul>
  </section>
</div>

<style>
  .dependencies-view {
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

  .section-description {
    margin-bottom: 16px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
  }

  .items-list {
    margin-bottom: 16px;
  }

  .empty-message {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    margin: 0;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .item-id {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--vscode-errorForeground);
    cursor: pointer;
    font-size: 1.2em;
    padding: 0 4px;
    opacity: 0.7;
  }

  .remove-btn:hover {
    opacity: 1;
  }

  .add-section {
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
  }

  .add-section label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9em;
    font-weight: 500;
  }

  .input-row {
    display: flex;
    gap: 8px;
  }

  .input-row input {
    flex: 1;
    padding: 6px 8px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    border-radius: 2px;
  }

  .add-btn {
    padding: 6px 16px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 2px;
    cursor: pointer;
  }

  .add-btn:hover:not(:disabled) {
    background-color: var(--vscode-button-hoverBackground);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .validation-error {
    display: block;
    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-errorForeground);
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
    margin: 0 0 12px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin: 0 0 16px;
  }

  dt {
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  dd {
    margin: 0;
    color: var(--vscode-descriptionForeground);
  }

  .help-section ul {
    margin: 0;
    padding-left: 20px;
    color: var(--vscode-descriptionForeground);
  }

  .help-section li {
    margin: 4px 0;
  }

  code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }
</style>
