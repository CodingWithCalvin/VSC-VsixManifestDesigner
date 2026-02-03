<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';
  import DataGrid, { type Column } from '../DataGrid.svelte';

  interface ColorTheme {
    id?: string;
    label: string;
    uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
    path: string;
  }

  interface IconTheme {
    id: string;
    label: string;
    path: string;
  }

  interface ProductIconTheme {
    id: string;
    label: string;
    path: string;
  }

  type ThemeType = 'color' | 'icon' | 'productIcon';

  let selectedType: ThemeType = 'color';
  let dataGrids: Record<string, DataGrid> = {};

  $: colorThemes = ($manifest?.contributes?.themes as ColorTheme[]) || [];
  $: iconThemes = ($manifest?.contributes?.iconThemes as IconTheme[]) || [];
  $: productIconThemes = ($manifest?.contributes?.productIconThemes as ProductIconTheme[]) || [];

  const colorThemeColumns: Column[] = [
    { key: 'label', label: 'Label', required: true, placeholder: 'My Dark Theme' },
    {
      key: 'uiTheme',
      label: 'UI Theme',
      required: true,
      type: 'select',
      options: ['vs', 'vs-dark', 'hc-black', 'hc-light'],
    },
    { key: 'path', label: 'Path', required: true, placeholder: './themes/my-theme.json' },
    { key: 'id', label: 'ID', placeholder: 'my-dark-theme' },
  ];

  const iconThemeColumns: Column[] = [
    { key: 'id', label: 'ID', required: true, placeholder: 'my-icons' },
    { key: 'label', label: 'Label', required: true, placeholder: 'My Icons' },
    { key: 'path', label: 'Path', required: true, placeholder: './icons/my-icons.json' },
  ];

  const productIconThemeColumns: Column[] = [
    { key: 'id', label: 'ID', required: true, placeholder: 'my-product-icons' },
    { key: 'label', label: 'Label', required: true, placeholder: 'My Product Icons' },
    { key: 'path', label: 'Path', required: true, placeholder: './icons/product-icons.json' },
  ];

  const themeTypes = [
    { id: 'color' as const, label: 'Color Themes', description: 'Editor and UI colors' },
    { id: 'icon' as const, label: 'File Icons', description: 'File and folder icons' },
    { id: 'productIcon' as const, label: 'Product Icons', description: 'UI icons (sidebar, status bar)' },
  ];

  function getCurrentItems() {
    switch (selectedType) {
      case 'color':
        return colorThemes;
      case 'icon':
        return iconThemes;
      case 'productIcon':
        return productIconThemes;
    }
  }

  function getCurrentColumns() {
    switch (selectedType) {
      case 'color':
        return colorThemeColumns;
      case 'icon':
        return iconThemeColumns;
      case 'productIcon':
        return productIconThemeColumns;
    }
  }

  function handleAdd() {
    const dataGrid = dataGrids[selectedType];
    if (!dataGrid) return;

    const newItem = dataGrid.getNewItem();

    switch (selectedType) {
      case 'color':
        if (!newItem.label || !newItem.uiTheme || !newItem.path) return;
        const colorTheme: ColorTheme = {
          label: newItem.label as string,
          uiTheme: newItem.uiTheme as ColorTheme['uiTheme'],
          path: newItem.path as string,
        };
        if (newItem.id) colorTheme.id = newItem.id as string;
        updateColorThemes([...colorThemes, colorTheme]);
        break;

      case 'icon':
        if (!newItem.id || !newItem.label || !newItem.path) return;
        const iconTheme: IconTheme = {
          id: newItem.id as string,
          label: newItem.label as string,
          path: newItem.path as string,
        };
        updateIconThemes([...iconThemes, iconTheme]);
        break;

      case 'productIcon':
        if (!newItem.id || !newItem.label || !newItem.path) return;
        const productIconTheme: ProductIconTheme = {
          id: newItem.id as string,
          label: newItem.label as string,
          path: newItem.path as string,
        };
        updateProductIconThemes([...productIconThemes, productIconTheme]);
        break;
    }
  }

  function handleEdit(event: CustomEvent<{ index: number; item: Record<string, unknown> }>) {
    const { index, item } = event.detail;

    switch (selectedType) {
      case 'color':
        const colorTheme: ColorTheme = {
          label: item.label as string,
          uiTheme: item.uiTheme as ColorTheme['uiTheme'],
          path: item.path as string,
        };
        if (item.id) colorTheme.id = item.id as string;
        const newColorThemes = [...colorThemes];
        newColorThemes[index] = colorTheme;
        updateColorThemes(newColorThemes);
        break;

      case 'icon':
        const iconTheme: IconTheme = {
          id: item.id as string,
          label: item.label as string,
          path: item.path as string,
        };
        const newIconThemes = [...iconThemes];
        newIconThemes[index] = iconTheme;
        updateIconThemes(newIconThemes);
        break;

      case 'productIcon':
        const productIconTheme: ProductIconTheme = {
          id: item.id as string,
          label: item.label as string,
          path: item.path as string,
        };
        const newProductIconThemes = [...productIconThemes];
        newProductIconThemes[index] = productIconTheme;
        updateProductIconThemes(newProductIconThemes);
        break;
    }
  }

  function handleRemove(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;

    switch (selectedType) {
      case 'color':
        updateColorThemes(colorThemes.filter((_, i) => i !== index));
        break;
      case 'icon':
        updateIconThemes(iconThemes.filter((_, i) => i !== index));
        break;
      case 'productIcon':
        updateProductIconThemes(productIconThemes.filter((_, i) => i !== index));
        break;
    }
  }

  function updateColorThemes(themes: ColorTheme[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    if (themes.length > 0) {
      contributes.themes = themes;
    } else {
      delete contributes.themes;
    }
    manifestStore.updateField('contributes', contributes);
  }

  function updateIconThemes(themes: IconTheme[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    if (themes.length > 0) {
      contributes.iconThemes = themes;
    } else {
      delete contributes.iconThemes;
    }
    manifestStore.updateField('contributes', contributes);
  }

  function updateProductIconThemes(themes: ProductIconTheme[]) {
    const contributes = { ...($manifest?.contributes || {}) };
    if (themes.length > 0) {
      contributes.productIconThemes = themes;
    } else {
      delete contributes.productIconThemes;
    }
    manifestStore.updateField('contributes', contributes);
  }

  function getCount(type: ThemeType): number {
    switch (type) {
      case 'color':
        return colorThemes.length;
      case 'icon':
        return iconThemes.length;
      case 'productIcon':
        return productIconThemes.length;
    }
  }
</script>

<div class="themes-view">
  <h1>Themes</h1>
  <p class="description">
    Contribute color themes, file icon themes, and product icon themes.
  </p>

  <div class="theme-tabs">
    {#each themeTypes as type}
      <button
        class="theme-tab"
        class:active={selectedType === type.id}
        on:click={() => (selectedType = type.id)}
      >
        <span class="tab-label">{type.label}</span>
        {#if getCount(type.id) > 0}
          <span class="tab-count">{getCount(type.id)}</span>
        {/if}
      </button>
    {/each}
  </div>

  <section class="card">
    <div class="card-header">
      {themeTypes.find((t) => t.id === selectedType)?.label}
      <span class="header-description">
        — {themeTypes.find((t) => t.id === selectedType)?.description}
      </span>
    </div>
    <DataGrid
      bind:this={dataGrids[selectedType]}
      items={getCurrentItems()}
      columns={getCurrentColumns()}
      addLabel="Add Theme"
      emptyMessage="No themes of this type defined."
      on:add={handleAdd}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </section>

  <section class="help-section">
    {#if selectedType === 'color'}
      <h3>Color Theme Properties</h3>
      <dl>
        <dt>Label</dt>
        <dd>Display name in the theme picker</dd>

        <dt>UI Theme</dt>
        <dd>
          Base theme: <code>vs</code> (light), <code>vs-dark</code> (dark),
          <code>hc-black</code> (high contrast dark), <code>hc-light</code> (high contrast light)
        </dd>

        <dt>Path</dt>
        <dd>Relative path to the color theme JSON file</dd>

        <dt>ID</dt>
        <dd>Optional unique identifier (defaults to label)</dd>
      </dl>
    {:else if selectedType === 'icon'}
      <h3>File Icon Theme Properties</h3>
      <dl>
        <dt>ID</dt>
        <dd>Unique identifier for the icon theme</dd>

        <dt>Label</dt>
        <dd>Display name in the theme picker</dd>

        <dt>Path</dt>
        <dd>Relative path to the icon theme JSON definition</dd>
      </dl>

      <h3>Icon Theme File Structure</h3>
      <p>The icon theme JSON defines icons for file types, folder states, and specific filenames.</p>
    {:else}
      <h3>Product Icon Theme Properties</h3>
      <dl>
        <dt>ID</dt>
        <dd>Unique identifier for the product icon theme</dd>

        <dt>Label</dt>
        <dd>Display name in the theme picker</dd>

        <dt>Path</dt>
        <dd>Relative path to the product icon theme JSON definition</dd>
      </dl>

      <h3>About Product Icons</h3>
      <p>
        Product icons are the icons in VS Code's UI (sidebar, status bar, activity bar).
        They use a font-based approach for scalability.
      </p>
    {/if}
  </section>
</div>

<style>
  .themes-view {
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

  .theme-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .theme-tab {
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

  .theme-tab:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .theme-tab.active {
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

  code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }
</style>
