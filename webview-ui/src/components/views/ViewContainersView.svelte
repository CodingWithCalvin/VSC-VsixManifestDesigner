<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface ViewContainer {
    id: string;
    title: string;
    icon: string;
  }

  interface ViewsContainers {
    activitybar?: ViewContainer[];
    panel?: ViewContainer[];
  }

  type LocationType = 'activitybar' | 'panel';

  let selectedLocation: LocationType = 'activitybar';
  let dataGrids: Record<string, DataGrid> = {};

  $: viewsContainers = ($manifest?.contributes?.viewsContainers as ViewsContainers) || {};
  $: currentContainers = viewsContainers[selectedLocation] || [];

  const columns: Column[] = [
    { key: 'id', label: 'ID', required: true, placeholder: 'myViewContainer' },
    { key: 'title', label: 'Title', required: true, placeholder: 'My Views' },
    { key: 'icon', label: 'Icon', required: true, placeholder: 'resources/icon.svg' },
  ];

  const locations: { id: LocationType; label: string; description: string }[] = [
    { id: 'activitybar', label: 'Activity Bar', description: 'Left sidebar icons' },
    { id: 'panel', label: 'Panel', description: 'Bottom panel tabs' },
  ];

  function handleAdd() {
    const dataGrid = dataGrids[selectedLocation];
    if (!dataGrid) return;

    const newItem = dataGrid.getNewItem() as ViewContainer;
    if (!newItem.id || !newItem.title || !newItem.icon) return;

    const container: ViewContainer = {
      id: newItem.id,
      title: newItem.title,
      icon: newItem.icon,
    };

    const newContainers = [...currentContainers, container];
    updateContainers(selectedLocation, newContainers);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;
    const container: ViewContainer = {
      id: item.id as string,
      title: item.title as string,
      icon: item.icon as string,
    };

    const newContainers = [...currentContainers];
    newContainers[index] = container;
    updateContainers(selectedLocation, newContainers);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newContainers = currentContainers.filter((_, i) => i !== index);
    updateContainers(selectedLocation, newContainers);
  }

  function updateContainers(location: LocationType, containers: ViewContainer[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    const newViewsContainers = { ...viewsContainers };

    if (containers.length > 0) {
      newViewsContainers[location] = containers;
    } else {
      delete newViewsContainers[location];
    }

    if (Object.keys(newViewsContainers).length > 0) {
      contributes.viewsContainers = newViewsContainers;
    } else {
      delete contributes.viewsContainers;
    }

    manifestStore.updateField('contributes', contributes);
  }

  function getContainerCount(location: LocationType): number {
    return viewsContainers[location]?.length || 0;
  }
</script>

<div class="view-containers-view">
  <h1>View Containers</h1>
  <p class="description">
    Define custom containers in the Activity Bar or Panel to hold your views.
  </p>

  <div class="location-tabs">
    {#each locations as location}
      <button
        class="location-tab"
        class:active={selectedLocation === location.id}
        on:click={() => (selectedLocation = location.id)}
      >
        <span class="tab-label">{location.label}</span>
        {#if getContainerCount(location.id) > 0}
          <span class="tab-count">{getContainerCount(location.id)}</span>
        {/if}
      </button>
    {/each}
  </div>

  <section class="card">
    <div class="card-header">
      {locations.find((l) => l.id === selectedLocation)?.label} Containers
      <span class="header-description">
        — {locations.find((l) => l.id === selectedLocation)?.description}
      </span>
    </div>
    <DataGrid
      bind:this={dataGrids[selectedLocation]}
      items={currentContainers}
      {columns}
      addLabel="Add Container"
      emptyMessage="No view containers defined for this location."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    <h3>View Container Properties</h3>
    <dl>
      <dt>ID</dt>
      <dd>Unique identifier for the container. Used to register views in this container.</dd>

      <dt>Title</dt>
      <dd>Display name shown in the Activity Bar tooltip or Panel tab.</dd>

      <dt>Icon</dt>
      <dd>
        Path to an SVG icon (24x24) relative to extension root. For Activity Bar, use a
        monochrome icon that works with VS Code themes.
      </dd>
    </dl>

    <h3>Usage</h3>
    <p>After creating a container, add views to it using the <strong>Views</strong> section.</p>
    <pre><code>// Reference in views
"contributes": &#123;
  "views": &#123;
    "myViewContainer": [
      &#123; "id": "myView", "name": "My View" &#125;
    ]
  &#125;
&#125;</code></pre>
  </section>
</div>

<style>
  .view-containers-view {
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

  .location-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .location-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    color: var(--vscode-foreground);
    cursor: pointer;
    font-size: inherit;
  }

  .location-tab:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .location-tab.active {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
    border-color: var(--vscode-focusBorder);
  }

  .tab-count {
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.8em;
  }

  .card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .header-description {
    font-weight: normal;
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
</style>
