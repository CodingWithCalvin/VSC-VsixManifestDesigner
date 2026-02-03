<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface MenuItem {
    command?: string;
    submenu?: string;
    when?: string;
    group?: string;
    alt?: string;
  }

  type Menus = Record<string, MenuItem[]>;

  const MENU_LOCATIONS = [
    { id: 'commandPalette', label: 'Command Palette', description: 'Filter commands shown in palette' },
    { id: 'editor/title', label: 'Editor Title', description: 'Editor tab title bar' },
    { id: 'editor/title/context', label: 'Editor Title Context', description: 'Right-click on editor tab' },
    { id: 'editor/title/run', label: 'Editor Title Run', description: 'Run button in editor title' },
    { id: 'editor/context', label: 'Editor Context', description: 'Right-click in editor' },
    { id: 'editor/lineNumber/context', label: 'Line Number Context', description: 'Right-click on line number' },
    { id: 'explorer/context', label: 'Explorer Context', description: 'Right-click in Explorer' },
    { id: 'scm/title', label: 'SCM Title', description: 'Source Control view title' },
    { id: 'scm/sourceControl', label: 'SCM Source Control', description: 'Source Control repository' },
    { id: 'scm/resourceGroup/context', label: 'SCM Resource Group', description: 'SCM resource group context' },
    { id: 'scm/resourceState/context', label: 'SCM Resource State', description: 'SCM resource state context' },
    { id: 'scm/resourceFolder/context', label: 'SCM Resource Folder', description: 'SCM resource folder context' },
    { id: 'scm/change/title', label: 'SCM Change Title', description: 'SCM change title actions' },
    { id: 'view/title', label: 'View Title', description: 'View title bar actions' },
    { id: 'view/item/context', label: 'View Item Context', description: 'Right-click on view item' },
    { id: 'debug/callstack/context', label: 'Debug Call Stack', description: 'Debug call stack context' },
    { id: 'debug/variables/context', label: 'Debug Variables', description: 'Debug variables context' },
    { id: 'debug/toolBar', label: 'Debug Toolbar', description: 'Debug toolbar actions' },
    { id: 'terminal/title/context', label: 'Terminal Title Context', description: 'Terminal tab context' },
    { id: 'terminal/context', label: 'Terminal Context', description: 'Terminal panel context' },
    { id: 'timeline/title', label: 'Timeline Title', description: 'Timeline view title' },
    { id: 'timeline/item/context', label: 'Timeline Item Context', description: 'Timeline item context' },
    { id: 'extension/context', label: 'Extension Context', description: 'Extensions view context' },
    { id: 'webview/context', label: 'Webview Context', description: 'Webview context menu' },
  ];

  let selectedLocation = 'commandPalette';
  let dataGrids: Record<string, DataGrid> = {};

  $: menus = ($manifest?.contributes?.menus as Menus) || {};
  $: currentMenuItems = menus[selectedLocation] || [];
  $: locationInfo = MENU_LOCATIONS.find((l) => l.id === selectedLocation);

  const columns: Column[] = [
    { key: 'command', label: 'Command', required: true, placeholder: 'myExtension.myCommand' },
    { key: 'when', label: 'When', placeholder: 'editorFocus' },
    { key: 'group', label: 'Group', placeholder: 'navigation' },
    { key: 'alt', label: 'Alt Command', placeholder: 'myExtension.altCommand' },
  ];

  function handleAdd() {
    const dataGrid = dataGrids[selectedLocation];
    if (!dataGrid) return;

    const newItem = dataGrid.getNewItem() as MenuItem;
    if (!newItem.command) return;

    const menuItem: MenuItem = {
      command: newItem.command,
    };
    if (newItem.when) menuItem.when = newItem.when;
    if (newItem.group) menuItem.group = newItem.group;
    if (newItem.alt) menuItem.alt = newItem.alt;

    const newMenuItems = [...currentMenuItems, menuItem];
    updateMenus(selectedLocation, newMenuItems);
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;
    const menuItem: MenuItem = {
      command: item.command as string,
    };
    if (item.when) menuItem.when = item.when as string;
    if (item.group) menuItem.group = item.group as string;
    if (item.alt) menuItem.alt = item.alt as string;

    const newMenuItems = [...currentMenuItems];
    newMenuItems[index] = menuItem;
    updateMenus(selectedLocation, newMenuItems);
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    const newMenuItems = currentMenuItems.filter((_, i) => i !== index);
    updateMenus(selectedLocation, newMenuItems);
  }

  function updateMenus(location: string, items: MenuItem[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    const newMenus = { ...menus };

    if (items.length > 0) {
      newMenus[location] = items;
    } else {
      delete newMenus[location];
    }

    if (Object.keys(newMenus).length > 0) {
      contributes.menus = newMenus;
    } else {
      delete contributes.menus;
    }

    manifestStore.updateField('contributes', contributes);
  }

  function getMenuCount(locationId: string): number {
    return menus[locationId]?.length || 0;
  }
</script>

<div class="menus-view">
  <h1>Menus</h1>
  <p class="description">
    Add commands to VS Code's menus and context menus throughout the UI.
  </p>

  <div class="menus-layout">
    <aside class="locations-sidebar">
      <div class="sidebar-header">Menu Locations</div>
      <ul class="locations-list">
        {#each MENU_LOCATIONS as location}
          <li>
            <button
              class="location-item"
              class:active={selectedLocation === location.id}
              on:click={() => (selectedLocation = location.id)}
            >
              <span class="location-label">{location.label}</span>
              {#if getMenuCount(location.id) > 0}
                <span class="location-count">{getMenuCount(location.id)}</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </aside>

    <main class="menus-content">
      <section class="card">
        <div class="card-header">
          {locationInfo?.label || selectedLocation}
          {#if locationInfo?.description}
            <span class="header-description">— {locationInfo.description}</span>
          {/if}
        </div>
        <DataGrid
          bind:this={dataGrids[selectedLocation]}
          items={currentMenuItems}
          {columns}
          addLabel="Add Menu Item"
          emptyMessage="No menu items for this location."
          on:add={handleAdd}
          on:edit={handleEdit}
          on:remove={handleRemove}
        />
      </section>

      <section class="help-section">
        <h3>Menu Item Properties</h3>
        <dl>
          <dt>Command</dt>
          <dd>The command ID to execute when clicked</dd>

          <dt>When</dt>
          <dd>
            <a href="https://code.visualstudio.com/api/references/when-clause-contexts" target="_blank">When clause</a>
            controlling when the item is visible
          </dd>

          <dt>Group</dt>
          <dd>
            Menu group for ordering. Common groups: <code>navigation</code>, <code>1_modification</code>,
            <code>9_cutcopypaste</code>. Use <code>@</code> for sub-ordering (e.g., <code>navigation@1</code>)
          </dd>

          <dt>Alt Command</dt>
          <dd>Alternative command executed when Alt is held while clicking</dd>
        </dl>
      </section>
    </main>
  </div>
</div>

<style>
  .menus-view {
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

  .menus-layout {
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .locations-sidebar {
    width: 220px;
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

  .locations-list {
    list-style: none;
    margin: 0;
    padding: 8px 0;
    overflow-y: auto;
    flex: 1;
  }

  .location-item {
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

  .location-item:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .location-item.active {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }

  .location-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .location-count {
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.8em;
    flex-shrink: 0;
  }

  .menus-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
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
</style>
