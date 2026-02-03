<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  interface Scripts {
    'vscode:prepublish'?: string;
    'vscode:uninstall'?: string;
    [key: string]: string | undefined;
  }

  $: l10n = ($manifest?.l10n as string) || '';
  $: scripts = ($manifest?.scripts as Scripts) || {};
  $: prepublishScript = scripts['vscode:prepublish'] || '';
  $: uninstallScript = scripts['vscode:uninstall'] || '';
  $: contributes = ($manifest?.contributes as Record<string, unknown>) || {};

  // Track which advanced contributions exist
  $: hasDebuggers = Array.isArray(contributes.debuggers) && contributes.debuggers.length > 0;
  $: hasTaskDefinitions = Array.isArray(contributes.taskDefinitions) && contributes.taskDefinitions.length > 0;
  $: hasProblemMatchers = Array.isArray(contributes.problemMatchers) && contributes.problemMatchers.length > 0;
  $: hasProblemPatterns = Array.isArray(contributes.problemPatterns) && contributes.problemPatterns.length > 0;
  $: hasJsonValidation = Array.isArray(contributes.jsonValidation) && contributes.jsonValidation.length > 0;
  $: hasCustomEditors = Array.isArray(contributes.customEditors) && contributes.customEditors.length > 0;
  $: hasNotebooks = Array.isArray(contributes.notebooks) && contributes.notebooks.length > 0;
  $: hasNotebookRenderer = Array.isArray(contributes.notebookRenderer) && contributes.notebookRenderer.length > 0;
  $: hasTerminal = contributes.terminal !== undefined;
  $: hasAuthentication = Array.isArray(contributes.authentication) && contributes.authentication.length > 0;
  $: hasWalkthroughs = Array.isArray(contributes.walkthroughs) && contributes.walkthroughs.length > 0;

  function handleL10nChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('l10n', value);
    } else {
      manifestStore.updateField('l10n', undefined as unknown as string);
    }
  }

  function handleScriptChange(scriptName: string, value: string) {
    const newScripts = { ...scripts };
    if (value) {
      newScripts[scriptName] = value;
    } else {
      delete newScripts[scriptName];
    }

    if (Object.keys(newScripts).length > 0) {
      manifestStore.updateField('scripts', newScripts);
    } else {
      manifestStore.updateField('scripts', undefined as unknown as Scripts);
    }
  }

  function handlePrepublishChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    handleScriptChange('vscode:prepublish', value);
  }

  function handleUninstallChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    handleScriptChange('vscode:uninstall', value);
  }

  interface ContributionInfo {
    key: string;
    name: string;
    description: string;
    hasContribution: boolean;
    count?: number;
  }

  $: advancedContributions = [
    {
      key: 'debuggers',
      name: 'Debuggers',
      description: 'Debug adapter configurations',
      hasContribution: hasDebuggers,
      count: (contributes.debuggers as unknown[])?.length,
    },
    {
      key: 'taskDefinitions',
      name: 'Task Definitions',
      description: 'Custom task types',
      hasContribution: hasTaskDefinitions,
      count: (contributes.taskDefinitions as unknown[])?.length,
    },
    {
      key: 'problemMatchers',
      name: 'Problem Matchers',
      description: 'Parse build/lint output for problems',
      hasContribution: hasProblemMatchers,
      count: (contributes.problemMatchers as unknown[])?.length,
    },
    {
      key: 'problemPatterns',
      name: 'Problem Patterns',
      description: 'Reusable patterns for problem matchers',
      hasContribution: hasProblemPatterns,
      count: (contributes.problemPatterns as unknown[])?.length,
    },
    {
      key: 'jsonValidation',
      name: 'JSON Validation',
      description: 'JSON schema associations',
      hasContribution: hasJsonValidation,
      count: (contributes.jsonValidation as unknown[])?.length,
    },
    {
      key: 'customEditors',
      name: 'Custom Editors',
      description: 'Custom editor implementations',
      hasContribution: hasCustomEditors,
      count: (contributes.customEditors as unknown[])?.length,
    },
    {
      key: 'notebooks',
      name: 'Notebooks',
      description: 'Notebook document types',
      hasContribution: hasNotebooks,
      count: (contributes.notebooks as unknown[])?.length,
    },
    {
      key: 'notebookRenderer',
      name: 'Notebook Renderers',
      description: 'Custom notebook cell output renderers',
      hasContribution: hasNotebookRenderer,
      count: (contributes.notebookRenderer as unknown[])?.length,
    },
    {
      key: 'terminal',
      name: 'Terminal',
      description: 'Terminal profiles and integrations',
      hasContribution: hasTerminal,
    },
    {
      key: 'authentication',
      name: 'Authentication',
      description: 'Authentication providers',
      hasContribution: hasAuthentication,
      count: (contributes.authentication as unknown[])?.length,
    },
    {
      key: 'walkthroughs',
      name: 'Walkthroughs',
      description: 'Getting started guides',
      hasContribution: hasWalkthroughs,
      count: (contributes.walkthroughs as unknown[])?.length,
    },
  ];
</script>

<div class="advanced-view">
  <h1>Advanced</h1>
  <p class="description">
    Configure localization, lifecycle scripts, and view advanced contribution points.
  </p>

  <section class="card">
    <div class="card-header">Localization</div>
    <div class="card-content">
      <div class="form-group">
        <label for="l10n">Localization Path</label>
        <input
          id="l10n"
          type="text"
          value={l10n}
          on:change={handleL10nChange}
          placeholder="./l10n"
        />
        <span class="field-hint">
          Path to the folder containing localization bundles (bundle.l10n.*.json files)
        </span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Lifecycle Scripts</div>
    <div class="card-content">
      <div class="form-group">
        <label for="prepublish">vscode:prepublish</label>
        <input
          id="prepublish"
          type="text"
          value={prepublishScript}
          on:change={handlePrepublishChange}
          placeholder="npm run compile"
        />
        <span class="field-hint">
          Runs before the extension is packaged. Use for compilation/bundling.
        </span>
      </div>

      <div class="form-group">
        <label for="uninstall">vscode:uninstall</label>
        <input
          id="uninstall"
          type="text"
          value={uninstallScript}
          on:change={handleUninstallChange}
          placeholder="node ./out/uninstall.js"
        />
        <span class="field-hint">
          Runs when the extension is uninstalled. Limited to Node.js, no VS Code API access.
        </span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Advanced Contribution Points</div>
    <div class="card-content">
      <p class="section-description">
        These contribution points require complex JSON configuration and are best edited
        directly in the package.json file. This view shows which ones are defined.
      </p>

      <div class="contributions-grid">
        {#each advancedContributions as contrib}
          <div class="contribution-item" class:active={contrib.hasContribution}>
            <div class="contribution-icon">
              {#if contrib.hasContribution}
                <span class="check">✓</span>
              {:else}
                <span class="empty">○</span>
              {/if}
            </div>
            <div class="contribution-info">
              <div class="contribution-name">
                {contrib.name}
                {#if contrib.count}
                  <span class="contribution-count">({contrib.count})</span>
                {/if}
              </div>
              <div class="contribution-description">{contrib.description}</div>
            </div>
          </div>
        {/each}
      </div>

      <div class="edit-hint">
        <strong>Tip:</strong> To add or modify these contributions, right-click the file tab
        and select "Reopen Editor With..." → "Text Editor" to edit the raw JSON.
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3>Localization</h3>
    <p>
      To localize your extension, create <code>bundle.l10n.json</code> files for each language
      in the l10n folder (e.g., <code>bundle.l10n.de.json</code> for German).
    </p>

    <h3>Common Advanced Use Cases</h3>
    <dl>
      <dt>Debuggers</dt>
      <dd>Create debug adapters for new languages or runtimes</dd>

      <dt>Task Definitions</dt>
      <dd>Define custom task types with specific properties</dd>

      <dt>Custom Editors</dt>
      <dd>Provide specialized editors for specific file types</dd>

      <dt>Walkthroughs</dt>
      <dd>Create interactive getting-started guides for your extension</dd>
    </dl>

    <h3>Documentation Links</h3>
    <ul>
      <li><a href="https://code.visualstudio.com/api/extension-guides/debugger-extension" target="_blank">Debugger Extension Guide</a></li>
      <li><a href="https://code.visualstudio.com/api/extension-guides/task-provider" target="_blank">Task Provider Guide</a></li>
      <li><a href="https://code.visualstudio.com/api/extension-guides/custom-editors" target="_blank">Custom Editors Guide</a></li>
      <li><a href="https://code.visualstudio.com/api/references/contribution-points" target="_blank">All Contribution Points</a></li>
    </ul>
  </section>
</div>

<style>
  .advanced-view {
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

  .form-group input {
    width: 100%;
    padding: 6px 8px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    border-radius: 2px;
    font-family: var(--vscode-editor-font-family, monospace);
  }

  .field-hint {
    display: block;
    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .section-description {
    margin-bottom: 16px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
  }

  .contributions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  .contribution-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    border: 1px solid transparent;
  }

  .contribution-item.active {
    border-color: var(--vscode-focusBorder);
    background-color: var(--vscode-list-activeSelectionBackground);
  }

  .contribution-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  .contribution-icon .check {
    color: var(--vscode-testing-iconPassed, #89d185);
    font-weight: bold;
  }

  .contribution-icon .empty {
    color: var(--vscode-descriptionForeground);
  }

  .contribution-info {
    flex: 1;
    min-width: 0;
  }

  .contribution-name {
    font-weight: 500;
  }

  .contribution-count {
    font-weight: normal;
    color: var(--vscode-descriptionForeground);
    font-size: 0.9em;
  }

  .contribution-description {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .edit-hint {
    padding: 12px;
    background-color: var(--vscode-inputValidation-infoBackground, var(--vscode-editor-inactiveSelectionBackground));
    border: 1px solid var(--vscode-inputValidation-infoBorder, var(--vscode-panel-border));
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
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

  .help-section a {
    color: var(--vscode-textLink-foreground);
  }

  .help-section a:hover {
    color: var(--vscode-textLink-activeForeground);
  }

  code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }
</style>
