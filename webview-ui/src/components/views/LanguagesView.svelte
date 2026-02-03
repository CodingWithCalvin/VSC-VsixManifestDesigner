<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface Language {
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

  let dataGrid: DataGrid;

  $: languages = ($manifest?.contributes?.languages as Language[]) || [];

  // Simplified columns for the grid - complex fields edited separately
  const columns: Column[] = [
    { key: 'id', label: 'Language ID', required: true, placeholder: 'mylang' },
    { key: 'aliases', label: 'Aliases', placeholder: 'MyLang, My Language' },
    { key: 'extensions', label: 'Extensions', placeholder: '.ml, .mylang' },
    { key: 'filenames', label: 'Filenames', placeholder: 'Makefile, Dockerfile' },
    { key: 'configuration', label: 'Configuration', placeholder: './language-configuration.json' },
  ];

  function handleAdd() {
    const newItem = dataGrid.getNewItem();
    if (!newItem.id) return;

    const language: Language = {
      id: newItem.id as string,
    };

    // Parse comma-separated arrays
    if (newItem.aliases) {
      language.aliases = parseArray(newItem.aliases as string);
    }
    if (newItem.extensions) {
      language.extensions = parseArray(newItem.extensions as string);
    }
    if (newItem.filenames) {
      language.filenames = parseArray(newItem.filenames as string);
    }
    if (newItem.configuration) {
      language.configuration = newItem.configuration as string;
    }

    const newLanguages = [...languages, language];
    updateLanguages(newLanguages);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;

    const language: Language = {
      id: item.id as string,
    };

    if (item.aliases) {
      const aliases = typeof item.aliases === 'string' ? parseArray(item.aliases) : item.aliases;
      if (Array.isArray(aliases) && aliases.length > 0) language.aliases = aliases;
    }
    if (item.extensions) {
      const extensions = typeof item.extensions === 'string' ? parseArray(item.extensions) : item.extensions;
      if (Array.isArray(extensions) && extensions.length > 0) language.extensions = extensions;
    }
    if (item.filenames) {
      const filenames = typeof item.filenames === 'string' ? parseArray(item.filenames) : item.filenames;
      if (Array.isArray(filenames) && filenames.length > 0) language.filenames = filenames;
    }
    if (item.configuration) {
      language.configuration = item.configuration as string;
    }

    const newLanguages = [...languages];
    newLanguages[index] = language;
    updateLanguages(newLanguages);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newLanguages = languages.filter((_, i) => i !== index);
    updateLanguages(newLanguages);
  }

  function updateLanguages(newLanguages: Language[]) {
    const contributes = { ...($manifest?.contributes || {}) };

    if (newLanguages.length > 0) {
      contributes.languages = newLanguages;
    } else {
      delete contributes.languages;
    }

    manifestStore.updateField('contributes', contributes);
  }

  function parseArray(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function formatArray(arr: string[] | undefined): string {
    return arr?.join(', ') || '';
  }

  // Transform languages for display in grid
  $: displayLanguages = languages.map((lang) => ({
    ...lang,
    aliases: formatArray(lang.aliases),
    extensions: formatArray(lang.extensions),
    filenames: formatArray(lang.filenames),
  }));
</script>

<div class="languages-view">
  <h1>Languages</h1>
  <p class="description">
    Register programming languages and associate them with file extensions and configurations.
  </p>

  <section class="card">
    <div class="card-header">Language Contributions</div>
    <DataGrid
      bind:this={dataGrid}
      items={displayLanguages}
      {columns}
      addLabel="Add Language"
      emptyMessage="No languages defined."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>Language Properties</h3>
    <dl>
      <dt>Language ID</dt>
      <dd>Unique identifier (e.g., <code>javascript</code>, <code>python</code>)</dd>

      <dt>Aliases</dt>
      <dd>Display names shown in language picker (comma-separated)</dd>

      <dt>Extensions</dt>
      <dd>File extensions including the dot (comma-separated, e.g., <code>.js, .jsx</code>)</dd>

      <dt>Filenames</dt>
      <dd>Specific filenames without extension (comma-separated, e.g., <code>Makefile, Dockerfile</code>)</dd>

      <dt>Configuration</dt>
      <dd>Path to language-configuration.json for brackets, comments, etc.</dd>
    </dl>

    <h3>Language Configuration File</h3>
    <p>Create a <code>language-configuration.json</code> to define:</p>
    <ul>
      <li>Comment styles (line and block)</li>
      <li>Bracket pairs for matching</li>
      <li>Auto-closing pairs</li>
      <li>Surrounding pairs</li>
      <li>Folding rules</li>
      <li>Word patterns</li>
      <li>Indentation rules</li>
    </ul>
  </section>
</div>

<style>
  .languages-view {
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
    padding: 16px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
  }

  .help-section h3 {
    margin-top: 16px;
    margin-bottom: 12px;
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
    color: var(--vscode-descriptionForeground);
  }

  .help-section li {
    margin: 4px 0;
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
</style>
