<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface Command {
    command: string;
    title: string;
    shortTitle?: string;
    category?: string;
    icon?: string | { light: string; dark: string };
    enablement?: string;
  }

  let dataGrid: DataGrid;

  $: commands = ($manifest?.contributes?.commands as Command[]) || [];

  const columns: Column[] = [
    { key: 'command', label: 'Command ID', required: true, placeholder: 'myExtension.myCommand' },
    { key: 'title', label: 'Title', required: true, placeholder: 'My Command' },
    { key: 'shortTitle', label: 'Short Title', placeholder: 'Short' },
    { key: 'category', label: 'Category', placeholder: 'My Extension' },
    { key: 'icon', label: 'Icon', placeholder: '$(icon-name)' },
    { key: 'enablement', label: 'Enablement', placeholder: 'editorFocus' },
  ];

  function handleAdd() {
    const newItem = dataGrid.getNewItem() as Command;
    if (!newItem.command || !newItem.title) return;

    // Clean up empty optional fields
    const command: Command = {
      command: newItem.command,
      title: newItem.title,
    };
    if (newItem.shortTitle) command.shortTitle = newItem.shortTitle;
    if (newItem.category) command.category = newItem.category;
    if (newItem.icon) command.icon = newItem.icon;
    if (newItem.enablement) command.enablement = newItem.enablement;

    const newCommands = [...commands, command];
    updateCommands(newCommands);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;
    const command: Command = {
      command: item.command as string,
      title: item.title as string,
    };
    if (item.shortTitle) command.shortTitle = item.shortTitle as string;
    if (item.category) command.category = item.category as string;
    if (item.icon) command.icon = item.icon as string;
    if (item.enablement) command.enablement = item.enablement as string;

    const newCommands = [...commands];
    newCommands[index] = command;
    updateCommands(newCommands);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newCommands = commands.filter((_, i) => i !== index);
    updateCommands(newCommands);
  }

  function updateCommands(newCommands: Command[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    if (newCommands.length > 0) {
      contributes.commands = newCommands;
    } else {
      delete contributes.commands;
    }
    manifestStore.updateField('contributes', contributes);
  }
</script>

<div class="commands-view">
  <h1>Commands</h1>
  <p class="description">
    Define commands that users can invoke via the Command Palette or keyboard shortcuts.
  </p>

  <section class="card">
    <div class="card-header">Registered Commands</div>
    <DataGrid
      bind:this={dataGrid}
      items={commands}
      {columns}
      addLabel="Add Command"
      emptyMessage="No commands defined. Add a command to get started."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>Command Properties</h3>
    <dl>
      <dt>Command ID</dt>
      <dd>Unique identifier for the command (e.g., <code>myExtension.openSettings</code>)</dd>

      <dt>Title</dt>
      <dd>Display name shown in the Command Palette</dd>

      <dt>Short Title</dt>
      <dd>Shorter name for UI elements with limited space</dd>

      <dt>Category</dt>
      <dd>Groups related commands in the Command Palette (e.g., "Git", "File")</dd>

      <dt>Icon</dt>
      <dd>
        Icon using <a href="https://code.visualstudio.com/api/references/icons-in-labels" target="_blank">Product Icons</a>
        syntax: <code>$(icon-name)</code>
      </dd>

      <dt>Enablement</dt>
      <dd>
        <a href="https://code.visualstudio.com/api/references/when-clause-contexts" target="_blank">When clause</a>
        controlling when the command is enabled
      </dd>
    </dl>
  </section>
</div>

<style>
  .commands-view {
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
    margin-bottom: 12px;
    font-size: 1em;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin: 0;
  }

  dt {
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  dd {
    margin: 0;
    color: var(--vscode-descriptionForeground);
  }

  code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  a {
    color: var(--vscode-textLink-foreground);
  }

  a:hover {
    color: var(--vscode-textLink-activeForeground);
  }
</style>
