<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface Keybinding {
    command: string;
    key: string;
    mac?: string;
    linux?: string;
    win?: string;
    when?: string;
    args?: unknown;
  }

  let dataGrid: DataGrid;

  $: keybindings = ($manifest?.contributes?.keybindings as Keybinding[]) || [];

  const columns: Column[] = [
    { key: 'command', label: 'Command', required: true, placeholder: 'myExtension.myCommand' },
    { key: 'key', label: 'Key', required: true, placeholder: 'ctrl+shift+p' },
    { key: 'mac', label: 'Mac', placeholder: 'cmd+shift+p' },
    { key: 'linux', label: 'Linux', placeholder: 'ctrl+shift+p' },
    { key: 'win', label: 'Windows', placeholder: 'ctrl+shift+p' },
    { key: 'when', label: 'When', placeholder: 'editorTextFocus' },
  ];

  function handleAdd() {
    const newItem = dataGrid.getNewItem() as Keybinding;
    if (!newItem.command || !newItem.key) return;

    const keybinding: Keybinding = {
      command: newItem.command,
      key: newItem.key,
    };
    if (newItem.mac) keybinding.mac = newItem.mac;
    if (newItem.linux) keybinding.linux = newItem.linux;
    if (newItem.win) keybinding.win = newItem.win;
    if (newItem.when) keybinding.when = newItem.when;

    const newKeybindings = [...keybindings, keybinding];
    updateKeybindings(newKeybindings);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;
    const keybinding: Keybinding = {
      command: item.command as string,
      key: item.key as string,
    };
    if (item.mac) keybinding.mac = item.mac as string;
    if (item.linux) keybinding.linux = item.linux as string;
    if (item.win) keybinding.win = item.win as string;
    if (item.when) keybinding.when = item.when as string;

    const newKeybindings = [...keybindings];
    newKeybindings[index] = keybinding;
    updateKeybindings(newKeybindings);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newKeybindings = keybindings.filter((_, i) => i !== index);
    updateKeybindings(newKeybindings);
  }

  function updateKeybindings(newKeybindings: Keybinding[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    if (newKeybindings.length > 0) {
      contributes.keybindings = newKeybindings;
    } else {
      delete contributes.keybindings;
    }
    manifestStore.updateField('contributes', contributes);
  }
</script>

<div class="keybindings-view">
  <h1>Keybindings</h1>
  <p class="description">
    Define keyboard shortcuts that trigger commands in your extension.
  </p>

  <section class="card">
    <div class="card-header">Keyboard Shortcuts</div>
    <DataGrid
      bind:this={dataGrid}
      items={keybindings}
      {columns}
      addLabel="Add Keybinding"
      emptyMessage="No keybindings defined. Add a keyboard shortcut to get started."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>Key Syntax</h3>
    <p>Keys are specified using the following format:</p>
    <ul>
      <li><code>ctrl+shift+p</code> - Control + Shift + P</li>
      <li><code>cmd+k cmd+c</code> - Chord: Cmd+K followed by Cmd+C (Mac)</li>
      <li><code>alt+up</code> - Alt + Up Arrow</li>
      <li><code>shift+escape</code> - Shift + Escape</li>
    </ul>

    <h3>Modifier Keys</h3>
    <ul>
      <li><code>ctrl</code> - Control key (Cmd on Mac if no mac key specified)</li>
      <li><code>shift</code> - Shift key</li>
      <li><code>alt</code> - Alt key (Option on Mac)</li>
      <li><code>cmd</code> - Command key (Mac only)</li>
      <li><code>win</code> - Windows key (Windows only)</li>
    </ul>

    <h3>Platform-Specific Keys</h3>
    <p>
      Use <strong>Mac</strong>, <strong>Linux</strong>, and <strong>Windows</strong> columns
      to specify platform-specific bindings. The <strong>Key</strong> column is the default
      used when no platform-specific binding is provided.
    </p>
  </section>
</div>

<style>
  .keybindings-view {
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
  }

  .help-section {
    margin-top: 24px;
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
    margin: 8px 0;
    color: var(--vscode-descriptionForeground);
  }

  .help-section ul {
    margin: 8px 0;
    padding-left: 20px;
  }

  .help-section li {
    margin: 4px 0;
    color: var(--vscode-descriptionForeground);
  }

  code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }
</style>
