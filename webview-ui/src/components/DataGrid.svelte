<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface Column {
    key: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'select' | 'boolean' | 'json';
    options?: string[];
    width?: string;
    placeholder?: string;
  }

  export let items: Record<string, unknown>[] = [];
  export let columns: Column[] = [];
  export let addLabel = 'Add Item';
  export let emptyMessage = 'No items defined';
  export let editable = true;

  const dispatch = createEventDispatcher<{
    add: void;
    edit: { index: number; item: Record<string, unknown> };
    remove: { index: number };
    reorder: { fromIndex: number; toIndex: number };
  }>();

  let editingIndex: number | null = null;
  let editingItem: Record<string, unknown> = {};
  let isAdding = false;
  let newItem: Record<string, unknown> = {};

  function startEdit(index: number) {
    editingIndex = index;
    editingItem = { ...items[index] };
  }

  function cancelEdit() {
    editingIndex = null;
    editingItem = {};
  }

  function saveEdit() {
    if (editingIndex !== null) {
      dispatch('edit', { index: editingIndex, item: editingItem });
      editingIndex = null;
      editingItem = {};
    }
  }

  function startAdd() {
    isAdding = true;
    newItem = {};
    // Set defaults for required fields
    columns.forEach((col) => {
      if (col.type === 'boolean') {
        newItem[col.key] = false;
      } else {
        newItem[col.key] = '';
      }
    });
  }

  function cancelAdd() {
    isAdding = false;
    newItem = {};
  }

  function saveAdd() {
    // Validate required fields
    const missingRequired = columns
      .filter((col) => col.required && !newItem[col.key])
      .map((col) => col.label);

    if (missingRequired.length > 0) {
      return; // Don't save if required fields are missing
    }

    dispatch('add');
    // The parent component handles adding to the array
    // We pass newItem through a different mechanism
    isAdding = false;
  }

  function remove(index: number) {
    dispatch('remove', { index });
  }

  function handleKeydown(event: KeyboardEvent, action: 'save' | 'cancel') {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (action === 'save') {
        if (isAdding) saveAdd();
        else saveEdit();
      }
    } else if (event.key === 'Escape') {
      if (isAdding) cancelAdd();
      else cancelEdit();
    }
  }

  // Expose newItem for parent to read
  export function getNewItem(): Record<string, unknown> {
    return newItem;
  }

  export function getEditingItem(): Record<string, unknown> {
    return editingItem;
  }

  function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
</script>

<div class="data-grid">
  <div class="grid-header">
    <div class="header-row">
      {#each columns as column}
        <div class="header-cell" style={column.width ? `width: ${column.width}` : ''}>
          {column.label}
          {#if column.required}<span class="required">*</span>{/if}
        </div>
      {/each}
      {#if editable}
        <div class="header-cell actions-cell">Actions</div>
      {/if}
    </div>
  </div>

  <div class="grid-body">
    {#if items.length === 0 && !isAdding}
      <div class="empty-message">{emptyMessage}</div>
    {/if}

    {#each items as item, index}
      <div class="grid-row" class:editing={editingIndex === index}>
        {#if editingIndex === index}
          <!-- Editing mode -->
          {#each columns as column}
            <div class="grid-cell" style={column.width ? `width: ${column.width}` : ''}>
              {#if column.type === 'select' && column.options}
                <select
                  bind:value={editingItem[column.key]}
                  on:keydown={(e) => handleKeydown(e, 'save')}
                >
                  <option value="">-- Select --</option>
                  {#each column.options as option}
                    <option value={option}>{option}</option>
                  {/each}
                </select>
              {:else if column.type === 'boolean'}
                <label class="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem[column.key])}
                    on:change={(e) => (editingItem[column.key] = e.currentTarget.checked)}
                  />
                </label>
              {:else}
                <input
                  type="text"
                  value={formatValue(editingItem[column.key])}
                  on:input={(e) => (editingItem[column.key] = e.currentTarget.value)}
                  on:keydown={(e) => handleKeydown(e, 'save')}
                  placeholder={column.placeholder}
                />
              {/if}
            </div>
          {/each}
          <div class="grid-cell actions-cell">
            <button class="icon-btn save" on:click={saveEdit} title="Save">✓</button>
            <button class="icon-btn cancel" on:click={cancelEdit} title="Cancel">✕</button>
          </div>
        {:else}
          <!-- Display mode -->
          {#each columns as column}
            <div class="grid-cell" style={column.width ? `width: ${column.width}` : ''}>
              {#if column.type === 'boolean'}
                <span class="boolean-value">{item[column.key] ? '✓' : ''}</span>
              {:else}
                <span class="cell-value" title={formatValue(item[column.key])}>
                  {formatValue(item[column.key])}
                </span>
              {/if}
            </div>
          {/each}
          {#if editable}
            <div class="grid-cell actions-cell">
              <button
                class="icon-btn edit"
                on:click={() => startEdit(index)}
                title="Edit"
                disabled={isAdding || editingIndex !== null}
              >
                ✎
              </button>
              <button
                class="icon-btn remove"
                on:click={() => remove(index)}
                title="Remove"
                disabled={isAdding || editingIndex !== null}
              >
                🗑
              </button>
            </div>
          {/if}
        {/if}
      </div>
    {/each}

    {#if isAdding}
      <!-- New item row -->
      <div class="grid-row adding">
        {#each columns as column}
          <div class="grid-cell" style={column.width ? `width: ${column.width}` : ''}>
            {#if column.type === 'select' && column.options}
              <select
                bind:value={newItem[column.key]}
                on:keydown={(e) => handleKeydown(e, 'save')}
              >
                <option value="">-- Select --</option>
                {#each column.options as option}
                  <option value={option}>{option}</option>
                {/each}
              </select>
            {:else if column.type === 'boolean'}
              <label class="checkbox-cell">
                <input
                  type="checkbox"
                  checked={Boolean(newItem[column.key])}
                  on:change={(e) => (newItem[column.key] = e.currentTarget.checked)}
                />
              </label>
            {:else}
              <input
                type="text"
                bind:value={newItem[column.key]}
                on:keydown={(e) => handleKeydown(e, 'save')}
                placeholder={column.placeholder || column.label}
                class:error={column.required && !newItem[column.key]}
              />
            {/if}
          </div>
        {/each}
        <div class="grid-cell actions-cell">
          <button class="icon-btn save" on:click={saveAdd} title="Save">✓</button>
          <button class="icon-btn cancel" on:click={cancelAdd} title="Cancel">✕</button>
        </div>
      </div>
    {/if}
  </div>

  {#if editable && !isAdding && editingIndex === null}
    <div class="grid-footer">
      <button class="add-btn" on:click={startAdd}>+ {addLabel}</button>
    </div>
  {/if}
</div>

<style>
  .data-grid {
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    overflow: hidden;
  }

  .grid-header {
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  .header-row,
  .grid-row {
    display: flex;
    align-items: stretch;
  }

  .header-cell,
  .grid-cell {
    flex: 1;
    padding: 8px 12px;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .header-cell {
    font-weight: 600;
    font-size: 0.9em;
    color: var(--vscode-foreground);
  }

  .required {
    color: var(--vscode-errorForeground);
    margin-left: 2px;
  }

  .actions-cell {
    flex: 0 0 80px;
    justify-content: center;
    gap: 4px;
  }

  .grid-body {
    max-height: 400px;
    overflow-y: auto;
  }

  .grid-row {
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  .grid-row:last-child {
    border-bottom: none;
  }

  .grid-row:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .grid-row.editing,
  .grid-row.adding {
    background-color: var(--vscode-editor-inactiveSelectionBackground);
  }

  .grid-cell input[type='text'],
  .grid-cell select {
    width: 100%;
    padding: 4px 8px;
    font-size: inherit;
  }

  .grid-cell input.error {
    border-color: var(--vscode-inputValidation-errorBorder);
  }

  .cell-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .boolean-value {
    color: var(--vscode-testing-iconPassed);
  }

  .checkbox-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .empty-message {
    padding: 24px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .icon-btn:hover:not(:disabled) {
    background-color: var(--vscode-toolbar-hoverBackground);
  }

  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-btn.save {
    color: var(--vscode-testing-iconPassed);
  }

  .icon-btn.cancel {
    color: var(--vscode-errorForeground);
  }

  .icon-btn.edit {
    color: var(--vscode-foreground);
  }

  .icon-btn.remove {
    color: var(--vscode-errorForeground);
  }

  .grid-footer {
    padding: 8px 12px;
    border-top: 1px solid var(--vscode-panel-border);
    background-color: var(--vscode-editor-inactiveSelectionBackground);
  }

  .add-btn {
    background: transparent;
    color: var(--vscode-textLink-foreground);
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: inherit;
  }

  .add-btn:hover {
    color: var(--vscode-textLink-activeForeground);
    text-decoration: underline;
  }
</style>
