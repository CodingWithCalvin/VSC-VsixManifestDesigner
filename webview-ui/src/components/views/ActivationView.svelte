<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  interface Command {
    command: string;
    title: string;
  }

  interface View {
    id: string;
  }

  type Views = Record<string, View[]>;

  $: activationEvents = ($manifest?.activationEvents as string[]) || [];
  $: mainEntry = $manifest?.main as string | undefined;
  $: browserEntry = $manifest?.browser as string | undefined;

  // Get commands and views for suggestions
  $: commands = (($manifest?.contributes as Record<string, unknown>)?.commands as Command[]) || [];
  $: views = (($manifest?.contributes as Record<string, unknown>)?.views as Views) || {};
  $: allViewIds = Object.values(views).flat().map((v) => v.id);
  $: languages = (($manifest?.contributes as Record<string, unknown>)?.languages as { id: string }[]) || [];

  let newEvent = '';
  let selectedPattern = '';

  const eventPatterns = [
    { pattern: 'onLanguage:', description: 'Activate when a file of this language is opened', placeholder: 'javascript' },
    { pattern: 'onCommand:', description: 'Activate when this command is invoked', placeholder: 'extension.helloWorld' },
    { pattern: 'onView:', description: 'Activate when this view is expanded', placeholder: 'myView' },
    { pattern: 'workspaceContains:', description: 'Activate when workspace contains matching file', placeholder: '**/.gitignore' },
    { pattern: 'onFileSystem:', description: 'Activate when files from this scheme are accessed', placeholder: 'sftp' },
    { pattern: 'onDebug', description: 'Activate when debugging starts', placeholder: '' },
    { pattern: 'onDebugInitialConfigurations', description: 'Activate before debug configurations are computed', placeholder: '' },
    { pattern: 'onDebugResolve:', description: 'Activate when debug type needs resolving', placeholder: 'node' },
    { pattern: 'onUri', description: 'Activate when extension URI is opened', placeholder: '' },
    { pattern: 'onWebviewPanel:', description: 'Activate when webview with viewType is restored', placeholder: 'myWebview' },
    { pattern: 'onCustomEditor:', description: 'Activate when custom editor is opened', placeholder: 'myEditor' },
    { pattern: 'onAuthenticationRequest:', description: 'Activate on authentication request', placeholder: 'github' },
    { pattern: 'onStartupFinished', description: 'Activate after VS Code startup is complete', placeholder: '' },
    { pattern: '*', description: 'Activate immediately on startup (not recommended)', placeholder: '' },
  ];

  function handleAddEvent() {
    if (!newEvent.trim()) return;

    const event = newEvent.trim();
    if (activationEvents.includes(event)) return;

    const newEvents = [...activationEvents, event];
    manifestStore.updateField('activationEvents', newEvents);
    newEvent = '';
    selectedPattern = '';
  }

  function handleRemoveEvent(event: string) {
    const newEvents = activationEvents.filter((e) => e !== event);
    updateActivationEvents(newEvents);
  }

  function updateActivationEvents(events: string[]) {
    if (events.length > 0) {
      manifestStore.updateField('activationEvents', events);
    } else {
      // Remove the field entirely if empty
      manifestStore.updateField('activationEvents', undefined as unknown as string[]);
    }
  }

  function handlePatternSelect(pattern: string) {
    selectedPattern = pattern;
    if (pattern === '*' || pattern === 'onUri' || pattern === 'onDebug' ||
        pattern === 'onDebugInitialConfigurations' || pattern === 'onStartupFinished') {
      newEvent = pattern;
    } else {
      newEvent = pattern;
    }
  }

  function addQuickEvent(event: string) {
    if (activationEvents.includes(event)) return;
    const newEvents = [...activationEvents, event];
    manifestStore.updateField('activationEvents', newEvents);
  }

  function handleMainChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('main', value);
    } else {
      manifestStore.updateField('main', undefined as unknown as string);
    }
  }

  function handleBrowserChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('browser', value);
    } else {
      manifestStore.updateField('browser', undefined as unknown as string);
    }
  }
</script>

<div class="activation-view">
  <h1>Activation</h1>
  <p class="description">
    Configure when your extension activates and its entry points.
  </p>

  <section class="card">
    <div class="card-header">Entry Points</div>
    <div class="card-content">
      <div class="form-group">
        <label for="main">Main Entry (Node.js)</label>
        <input
          id="main"
          type="text"
          value={mainEntry || ''}
          on:change={handleMainChange}
          placeholder="./out/extension.js"
        />
        <span class="field-hint">Entry point for desktop VS Code</span>
      </div>

      <div class="form-group">
        <label for="browser">Browser Entry (Web)</label>
        <input
          id="browser"
          type="text"
          value={browserEntry || ''}
          on:change={handleBrowserChange}
          placeholder="./out/web/extension.js"
        />
        <span class="field-hint">Entry point for VS Code for Web (vscode.dev)</span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Activation Events</div>
    <div class="card-content">
      <div class="events-list">
        {#if activationEvents.length === 0}
          <p class="empty-message">No activation events defined. Your extension won't activate automatically.</p>
        {:else}
          {#each activationEvents as event}
            <div class="event-item">
              <code class="event-code">{event}</code>
              <button class="remove-btn" on:click={() => handleRemoveEvent(event)} title="Remove">×</button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="add-event-section">
        <div class="pattern-selector">
          <label for="pattern-select">Event Type</label>
          <select id="pattern-select" bind:value={selectedPattern} on:change={() => handlePatternSelect(selectedPattern)}>
            <option value="">Select a pattern...</option>
            {#each eventPatterns as ep}
              <option value={ep.pattern}>{ep.pattern} - {ep.description}</option>
            {/each}
          </select>
        </div>

        <div class="event-input">
          <label for="new-event">Event</label>
          <div class="input-row">
            <input
              id="new-event"
              type="text"
              bind:value={newEvent}
              placeholder="onCommand:extension.helloWorld"
              on:keydown={(e) => e.key === 'Enter' && handleAddEvent()}
            />
            <button class="add-btn" on:click={handleAddEvent} disabled={!newEvent.trim()}>Add</button>
          </div>
        </div>
      </div>

      {#if commands.length > 0}
        <div class="quick-add">
          <span class="quick-label">Quick add commands:</span>
          <div class="quick-buttons">
            {#each commands.slice(0, 5) as cmd}
              {@const event = `onCommand:${cmd.command}`}
              <button
                class="quick-btn"
                class:added={activationEvents.includes(event)}
                on:click={() => addQuickEvent(event)}
                disabled={activationEvents.includes(event)}
              >
                {cmd.command}
              </button>
            {/each}
            {#if commands.length > 5}
              <span class="more-hint">+{commands.length - 5} more</span>
            {/if}
          </div>
        </div>
      {/if}

      {#if allViewIds.length > 0}
        <div class="quick-add">
          <span class="quick-label">Quick add views:</span>
          <div class="quick-buttons">
            {#each allViewIds.slice(0, 5) as viewId}
              {@const event = `onView:${viewId}`}
              <button
                class="quick-btn"
                class:added={activationEvents.includes(event)}
                on:click={() => addQuickEvent(event)}
                disabled={activationEvents.includes(event)}
              >
                {viewId}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if languages.length > 0}
        <div class="quick-add">
          <span class="quick-label">Quick add languages:</span>
          <div class="quick-buttons">
            {#each languages.slice(0, 5) as lang}
              {@const event = `onLanguage:${lang.id}`}
              <button
                class="quick-btn"
                class:added={activationEvents.includes(event)}
                on:click={() => addQuickEvent(event)}
                disabled={activationEvents.includes(event)}
              >
                {lang.id}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <section class="help-section">
    <h3>Common Activation Events</h3>
    <dl>
      <dt><code>onCommand:*</code></dt>
      <dd>Activates when a command is invoked. Most common pattern.</dd>

      <dt><code>onLanguage:*</code></dt>
      <dd>Activates when a file of the specified language is opened.</dd>

      <dt><code>onView:*</code></dt>
      <dd>Activates when a view is expanded in the sidebar.</dd>

      <dt><code>workspaceContains:*</code></dt>
      <dd>Activates when workspace contains files matching a glob pattern.</dd>

      <dt><code>onStartupFinished</code></dt>
      <dd>Activates after VS Code has fully started. Good for non-urgent initialization.</dd>

      <dt><code>*</code></dt>
      <dd>Activates immediately. Avoid unless absolutely necessary as it slows startup.</dd>
    </dl>
  </section>
</div>

<style>
  .activation-view {
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
  }

  .field-hint {
    display: block;
    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .events-list {
    margin-bottom: 16px;
  }

  .empty-message {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    margin: 0;
  }

  .event-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .event-code {
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

  .add-event-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
  }

  .pattern-selector label,
  .event-input label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .pattern-selector select {
    width: 100%;
    padding: 6px 8px;
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border, var(--vscode-panel-border));
    border-radius: 2px;
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

  .quick-add {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--vscode-panel-border);
  }

  .quick-label {
    display: block;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 8px;
  }

  .quick-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .quick-btn {
    padding: 4px 8px;
    font-size: 0.85em;
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  .quick-btn:hover:not(:disabled) {
    opacity: 0.8;
  }

  .quick-btn:disabled,
  .quick-btn.added {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .more-hint {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .help-section {
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

  dt code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  dd {
    margin: 0;
    color: var(--vscode-descriptionForeground);
  }
</style>
