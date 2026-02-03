<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface View {
    id: string;
    name: string;
    when?: string;
    contextualTitle?: string;
    visibility?: 'visible' | 'hidden' | 'collapsed';
    type?: 'tree' | 'webview';
  }

  interface ViewsContainers {
    activitybar?: { id: string }[];
    panel?: { id: string }[];
  }

  type Views = Record<string, View[]>;

  const BUILTIN_CONTAINERS = [
    { id: 'explorer', label: 'Explorer' },
    { id: 'scm', label: 'Source Control' },
    { id: 'debug', label: 'Run and Debug' },
    { id: 'test', label: 'Testing' },
  ];

  let selectedContainer = 'explorer';
  let dataGrids: Record<string, DataGrid> = {};

  $: views = ($manifest?.contributes?.views as Views) || {};
  $: viewsContainers = ($manifest?.contributes?.viewsContainers as ViewsContainers) || {};
  $: customContainers = [
    ...(viewsContainers.activitybar || []).map((c) => ({ id: c.id, label: c.id })),
    ...(viewsContainers.panel || []).map((c) => ({ id: c.id, label: c.id })),
  ];
  $: allContainers = [...BUILTIN_CONTAINERS, ...customContainers];
  $: currentViews = views[selectedContainer] || [];

  const columns: Column[] = [
    { key: 'id', label: 'ID', required: true, placeholder: 'myView' },
    { key: 'name', label: 'Name', required: true, placeholder: 'My View' },
    { key: 'when', label: 'When', placeholder: 'workspaceFolderCount > 0' },
    { key: 'contextualTitle', label: 'Contextual Title', placeholder: 'My Extension' },
    {
      key: 'visibility',
      label: 'Visibility',
      type: 'select',
      options: ['visible', 'hidden', 'collapsed'],
    },
    { key: 'type', label: 'Type', type: 'select', options: ['tree', 'webview'] },
  ];

  function handleAdd() {
    const dataGrid = dataGrids[selectedContainer];
    if (!dataGrid) return;

    const newItem = dataGrid.getNewItem() as View;
    if (!newItem.id || !newItem.name) return;

    const view: View = {
      id: newItem.id,
      name: newItem.name,
    };
    if (newItem.when) view.when = newItem.when;
    if (newItem.contextualTitle) view.contextualTitle = newItem.contextualTitle;
    if (newItem.visibility) view.visibility = newItem.visibility as View['visibility'];
    if (newItem.type) view.type = newItem.type as View['type'];

    const newViews = [...currentViews, view];
    updateViews(selectedContainer, newViews);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;
    const view: View = {
      id: item.id as string,
      name: item.name as string,
    };
    if (item.when) view.when = item.when as string;
    if (item.contextualTitle) view.contextualTitle = item.contextualTitle as string;
    if (item.visibility) view.visibility = item.visibility as View['visibility'];
    if (item.type) view.type = item.type as View['type'];

    const newViews = [...currentViews];
    newViews[index] = view;
    updateViews(selectedContainer, newViews);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newViews = currentViews.filter((_, i) => i !== index);
    updateViews(selectedContainer, newViews);
  }

  function updateViews(container: string, viewsList: View[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    const newViews = { ...views };

    if (viewsList.length > 0) {
      newViews[container] = viewsList;
    } else {
      delete newViews[container];
    }

    if (Object.keys(newViews).length > 0) {
      contributes.views = newViews;
    } else {
      delete contributes.views;
    }

    manifestStore.updateField('contributes', contributes);
  }

  function getViewCount(containerId: string): number {
    return views[containerId]?.length || 0;
  }
</script>

<div class="views-view">
  <h1>Views</h1>
  <p class="description">
    Add custom views to built-in or custom view containers.
  </p>

  <div class="views-layout">
    <aside class="containers-sidebar">
      <div class="sidebar-header">Containers</div>

      <div class="container-section">
        <div class="section-label">Built-in</div>
        <ul class="container-list">
          {#each BUILTIN_CONTAINERS as container}
            <li>
              <button
                class="container-item"
                class:active={selectedContainer === container.id}
                on:click={() => (selectedContainer = container.id)}
              >
                <span class="container-label">{container.label}</span>
                {#if getViewCount(container.id) > 0}
                  <span class="container-count">{getViewCount(container.id)}</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      </div>

      {#if customContainers.length > 0}
        <div class="container-section">
          <div class="section-label">Custom</div>
          <ul class="container-list">
            {#each customContainers as container}
              <li>
                <button
                  class="container-item"
                  class:active={selectedContainer === container.id}
                  on:click={() => (selectedContainer = container.id)}
                >
                  <span class="container-label">{container.label}</span>
                  {#if getViewCount(container.id) > 0}
                    <span class="container-count">{getViewCount(container.id)}</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if customContainers.length === 0}
        <div class="no-custom">
          <p>No custom containers.</p>
          <p>Create containers in <strong>View Containers</strong>.</p>
        </div>
      {/if}
    </aside>

    <main class="views-content">
      <section class="card">
        <div class="card-header">
          Views in "{allContainers.find((c) => c.id === selectedContainer)?.label || selectedContainer}"
        </div>
        <DataGrid
          bind:this={dataGrids[selectedContainer]}
          items={currentViews}
          {columns}
          addLabel="Add View"
          emptyMessage="No views in this container."
          on:add={handleAdd}
          on:edit={handleEdit}
          on:remove={handleRemove}
        />
      </section>

      <section class="help-section">
        <h3>View Properties</h3>
        <dl>
          <dt>ID</dt>
          <dd>Unique identifier for the view</dd>

          <dt>Name</dt>
          <dd>Display name shown in the view header</dd>

          <dt>When</dt>
          <dd>When clause controlling view visibility</dd>

          <dt>Contextual Title</dt>
          <dd>Title shown in the view's context menu</dd>

          <dt>Visibility</dt>
          <dd>Initial visibility state: visible, hidden, or collapsed</dd>

          <dt>Type</dt>
          <dd>View type: tree (default) or webview</dd>
        </dl>
      </section>
    </main>
  </div>
</div>

<style>
  .views-view {
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

  .views-layout {
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .containers-sidebar {
    width: 180px;
    flex-shrink: 0;
    background-color: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--vscode-panel-border);
    flex-shrink: 0;
  }

  .container-section {
    padding: 8px 0;
  }

  .section-label {
    padding: 4px 16px;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
  }

  .container-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .container-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    background: none;
    border: none;
    color: var(--vscode-foreground);
    cursor: pointer;
    text-align: left;
    font-size: 0.9em;
  }

  .container-item:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .container-item.active {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }

  .container-count {
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.8em;
  }

  .no-custom {
    padding: 16px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-size: 0.85em;
  }

  .no-custom p {
    margin: 4px 0;
  }

  .views-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
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
</style>
