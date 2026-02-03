<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface Grammar {
    language?: string;
    scopeName: string;
    path: string;
    embeddedLanguages?: Record<string, string>;
    tokenTypes?: Record<string, string>;
    injectTo?: string[];
    balancedBracketScopes?: string[];
    unbalancedBracketScopes?: string[];
  }

  let dataGrid: DataGrid;

  $: grammars = ($manifest?.contributes?.grammars as Grammar[]) || [];
  $: languages = ($manifest?.contributes?.languages as { id: string }[]) || [];
  $: languageIds = languages.map((l) => l.id);

  const columns: Column[] = [
    { key: 'language', label: 'Language', placeholder: 'mylang' },
    { key: 'scopeName', label: 'Scope Name', required: true, placeholder: 'source.mylang' },
    { key: 'path', label: 'Path', required: true, placeholder: './syntaxes/mylang.tmLanguage.json' },
    { key: 'injectTo', label: 'Inject To', placeholder: 'source.js, source.ts' },
  ];

  function handleAdd() {
    const newItem = dataGrid.getNewItem();
    if (!newItem.scopeName || !newItem.path) return;

    const grammar: Grammar = {
      scopeName: newItem.scopeName as string,
      path: newItem.path as string,
    };

    if (newItem.language) grammar.language = newItem.language as string;
    if (newItem.injectTo) {
      grammar.injectTo = parseArray(newItem.injectTo as string);
    }

    const newGrammars = [...grammars, grammar];
    updateGrammars(newGrammars);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;

    const grammar: Grammar = {
      scopeName: item.scopeName as string,
      path: item.path as string,
    };

    if (item.language) grammar.language = item.language as string;
    if (item.injectTo) {
      const injectTo = typeof item.injectTo === 'string' ? parseArray(item.injectTo) : item.injectTo;
      if (Array.isArray(injectTo) && injectTo.length > 0) grammar.injectTo = injectTo;
    }

    // Preserve complex fields that aren't in the grid
    const original = grammars[index];
    if (original.embeddedLanguages) grammar.embeddedLanguages = original.embeddedLanguages;
    if (original.tokenTypes) grammar.tokenTypes = original.tokenTypes;
    if (original.balancedBracketScopes) grammar.balancedBracketScopes = original.balancedBracketScopes;
    if (original.unbalancedBracketScopes) grammar.unbalancedBracketScopes = original.unbalancedBracketScopes;

    const newGrammars = [...grammars];
    newGrammars[index] = grammar;
    updateGrammars(newGrammars);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newGrammars = grammars.filter((_, i) => i !== index);
    updateGrammars(newGrammars);
  }

  function updateGrammars(newGrammars: Grammar[]) {
    const contributes = { ...($manifest?.contributes || {}) };

    if (newGrammars.length > 0) {
      contributes.grammars = newGrammars;
    } else {
      delete contributes.grammars;
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

  $: displayGrammars = grammars.map((g) => ({
    ...g,
    injectTo: formatArray(g.injectTo),
  }));
</script>

<div class="grammars-view">
  <h1>Grammars</h1>
  <p class="description">
    Register TextMate grammars for syntax highlighting of your languages.
  </p>

  <section class="card">
    <div class="card-header">TextMate Grammars</div>
    <DataGrid
      bind:this={dataGrid}
      items={displayGrammars}
      {columns}
      addLabel="Add Grammar"
      emptyMessage="No grammars defined."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>Grammar Properties</h3>
    <dl>
      <dt>Language</dt>
      <dd>Language ID this grammar applies to (should match a language contribution)</dd>

      <dt>Scope Name</dt>
      <dd>
        TextMate scope name (e.g., <code>source.js</code>, <code>text.html.basic</code>).
        Use <code>source.*</code> for programming languages, <code>text.*</code> for markup.
      </dd>

      <dt>Path</dt>
      <dd>
        Relative path to the grammar file (<code>.tmLanguage.json</code>, <code>.tmLanguage</code>,
        or <code>.plist</code>)
      </dd>

      <dt>Inject To</dt>
      <dd>
        Scope names to inject this grammar into (comma-separated). Used for embedded languages
        like CSS-in-JS or HTML templates.
      </dd>
    </dl>

    <h3>Grammar Types</h3>
    <ul>
      <li><strong>Main Grammar</strong>: Set <code>language</code> to associate with a language ID</li>
      <li><strong>Injection Grammar</strong>: Set <code>injectTo</code> to embed in other grammars</li>
    </ul>

    <h3>Creating Grammar Files</h3>
    <p>
      Use tools like <a href="https://github.com/RedCMD/TmLanguage-Syntax-Highlighter" target="_blank">TmLanguage Syntax Highlighter</a>
      to create and debug TextMate grammars.
    </p>
  </section>
</div>

<style>
  .grammars-view {
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

  a {
    color: var(--vscode-textLink-foreground);
  }

  a:hover {
    color: var(--vscode-textLink-activeForeground);
  }
</style>
