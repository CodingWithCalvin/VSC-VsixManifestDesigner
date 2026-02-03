<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface Snippet {
    language?: string;
    path: string;
  }

  let dataGrid: DataGrid;

  $: snippets = ($manifest?.contributes?.snippets as Snippet[]) || [];
  $: languages = ($manifest?.contributes?.languages as { id: string }[]) || [];
  $: languageIds = ['', ...languages.map((l) => l.id)];

  const columns: Column[] = [
    { key: 'language', label: 'Language', placeholder: 'javascript (blank for global)' },
    { key: 'path', label: 'Path', required: true, placeholder: './snippets/my-snippets.json' },
  ];

  function handleAdd() {
    const newItem = dataGrid.getNewItem();
    if (!newItem.path) return;

    const snippet: Snippet = {
      path: newItem.path as string,
    };

    if (newItem.language) snippet.language = newItem.language as string;

    const newSnippets = [...snippets, snippet];
    updateSnippets(newSnippets);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;

    const snippet: Snippet = {
      path: item.path as string,
    };

    if (item.language) snippet.language = item.language as string;

    const newSnippets = [...snippets];
    newSnippets[index] = snippet;
    updateSnippets(newSnippets);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newSnippets = snippets.filter((_, i) => i !== index);
    updateSnippets(newSnippets);
  }

  function updateSnippets(newSnippets: Snippet[]) {
    const contributes = { ...($manifest?.contributes || {}) };

    if (newSnippets.length > 0) {
      contributes.snippets = newSnippets;
    } else {
      delete contributes.snippets;
    }

    manifestStore.updateField('contributes', contributes);
  }
</script>

<div class="snippets-view">
  <h1>Snippets</h1>
  <p class="description">
    Contribute code snippets for specific languages or globally across all languages.
  </p>

  <section class="card">
    <div class="card-header">Snippet Files</div>
    <DataGrid
      bind:this={dataGrid}
      items={snippets}
      {columns}
      addLabel="Add Snippet File"
      emptyMessage="No snippets defined."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>Snippet Properties</h3>
    <dl>
      <dt>Language</dt>
      <dd>
        Language ID to scope snippets to (e.g., <code>javascript</code>, <code>python</code>).
        Leave blank for global snippets available in all languages.
      </dd>

      <dt>Path</dt>
      <dd>Relative path to the snippets JSON file</dd>
    </dl>

    <h3>Snippet File Format</h3>
    <pre><code>&#123;
  "Print to console": &#123;
    "prefix": "log",
    "body": [
      "console.log('$1');",
      "$2"
    ],
    "description": "Log output to console"
  &#125;
&#125;</code></pre>

    <h3>Snippet Syntax</h3>
    <ul>
      <li><code>$1</code>, <code>$2</code>, ... - Tab stops (cursor positions)</li>
      <li><code>$0</code> - Final cursor position</li>
      <li><code>$&#123;1:placeholder&#125;</code> - Tab stop with placeholder text</li>
      <li><code>$&#123;1|one,two,three|&#125;</code> - Tab stop with choices</li>
      <li><code>$TM_FILENAME</code>, <code>$CURRENT_YEAR</code> - Variables</li>
    </ul>

    <h3>Snippet Variables</h3>
    <ul>
      <li><code>TM_SELECTED_TEXT</code> - Currently selected text</li>
      <li><code>TM_CURRENT_LINE</code> - Contents of current line</li>
      <li><code>TM_FILENAME</code> - Filename of current document</li>
      <li><code>TM_DIRECTORY</code> - Directory of current document</li>
      <li><code>CLIPBOARD</code> - Clipboard contents</li>
      <li><code>CURRENT_YEAR</code>, <code>CURRENT_MONTH</code>, <code>CURRENT_DATE</code> - Date values</li>
      <li><code>RANDOM</code>, <code>RANDOM_HEX</code>, <code>UUID</code> - Random values</li>
    </ul>
  </section>
</div>

<style>
  .snippets-view {
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

  pre {
    margin: 12px 0;
    padding: 12px;
    background-color: var(--vscode-textCodeBlock-background);
    border-radius: 4px;
    overflow-x: auto;
  }

  code {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  dd code, li code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
  }
</style>
