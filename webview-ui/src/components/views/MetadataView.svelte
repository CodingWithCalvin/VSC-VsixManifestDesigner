<script lang="ts">
  import { manifest, validation, manifestStore } from '../../stores/manifestStore';

  // Valid VS Code extension categories
  const CATEGORIES = [
    'Azure',
    'Data Science',
    'Debuggers',
    'Education',
    'Extension Packs',
    'Formatters',
    'Keymaps',
    'Language Packs',
    'Linters',
    'Machine Learning',
    'Notebooks',
    'Other',
    'Programming Languages',
    'SCM Providers',
    'Snippets',
    'Testing',
    'Themes',
    'Visualization',
  ];

  // Local state for form inputs
  let name = '';
  let displayName = '';
  let version = '';
  let publisher = '';
  let description = '';
  let icon = '';
  let preview = false;
  let galleryBannerColor = '';
  let galleryBannerTheme: 'dark' | 'light' = 'dark';
  let selectedCategories: string[] = [];
  let keywordsInput = '';
  let keywords: string[] = [];

  // Sync local state with store
  $: if ($manifest) {
    name = $manifest.name || '';
    displayName = $manifest.displayName || '';
    version = $manifest.version || '';
    publisher = $manifest.publisher || '';
    description = $manifest.description || '';
    icon = $manifest.icon || '';
    preview = $manifest.preview || false;
    galleryBannerColor = $manifest.galleryBanner?.color || '';
    galleryBannerTheme = $manifest.galleryBanner?.theme || 'dark';
    selectedCategories = $manifest.categories || [];
    keywords = $manifest.keywords || [];
  }

  // Get validation errors for a specific field
  function getFieldErrors(fieldPath: string) {
    if (!$validation) return [];
    return [
      ...$validation.errors.filter((e) => e.path === fieldPath),
      ...$validation.warnings.filter((e) => e.path === fieldPath),
    ];
  }

  // Handle field changes
  function handleChange(field: string, value: unknown) {
    if (field.includes('.')) {
      manifestStore.updateNestedField(field, value);
    } else {
      manifestStore.updateField(field as keyof typeof $manifest, value as never);
    }
  }

  // Handle category toggle
  function toggleCategory(category: string) {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    handleChange('categories', newCategories);
  }

  // Handle keyword addition
  function addKeyword() {
    const trimmed = keywordsInput.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 30) {
      const newKeywords = [...keywords, trimmed];
      handleChange('keywords', newKeywords);
      keywordsInput = '';
    }
  }

  // Handle keyword removal
  function removeKeyword(keyword: string) {
    const newKeywords = keywords.filter((k) => k !== keyword);
    handleChange('keywords', newKeywords);
  }

  // Handle Enter key in keyword input
  function handleKeywordKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addKeyword();
    }
  }
</script>

<div class="metadata-view">
  <h1>Metadata</h1>

  <!-- Identity Section -->
  <section class="card">
    <div class="card-header">Identity</div>

    <div class="form-row">
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          on:blur={() => handleChange('name', name)}
          on:input={(e) => (name = e.currentTarget.value)}
          placeholder="my-extension"
          class:error={getFieldErrors('name').some((e) => e.severity === 'error')}
        />
        {#each getFieldErrors('name') as err}
          <div class="{err.severity}-message">{err.message}</div>
        {/each}
        <div class="help-text">Lowercase, no spaces. Used as the extension identifier.</div>
      </div>

      <div class="form-group">
        <label for="displayName">Display Name</label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          on:blur={() => handleChange('displayName', displayName)}
          on:input={(e) => (displayName = e.currentTarget.value)}
          placeholder="My Extension"
        />
        <div class="help-text">Human-readable name shown in the Marketplace.</div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="version">Version *</label>
        <input
          type="text"
          id="version"
          value={version}
          on:blur={() => handleChange('version', version)}
          on:input={(e) => (version = e.currentTarget.value)}
          placeholder="1.0.0"
          class:error={getFieldErrors('version').some((e) => e.severity === 'error')}
        />
        {#each getFieldErrors('version') as err}
          <div class="{err.severity}-message">{err.message}</div>
        {/each}
        <div class="help-text">Semantic version (major.minor.patch).</div>
      </div>

      <div class="form-group">
        <label for="publisher">Publisher *</label>
        <input
          type="text"
          id="publisher"
          value={publisher}
          on:blur={() => handleChange('publisher', publisher)}
          on:input={(e) => (publisher = e.currentTarget.value)}
          placeholder="your-publisher-id"
          class:error={getFieldErrors('publisher').some((e) => e.severity === 'error')}
        />
        {#each getFieldErrors('publisher') as err}
          <div class="{err.severity}-message">{err.message}</div>
        {/each}
        <div class="help-text">Your VS Code Marketplace publisher ID.</div>
      </div>
    </div>
  </section>

  <!-- Description Section -->
  <section class="card">
    <div class="card-header">Description</div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        value={description}
        on:blur={() => handleChange('description', description)}
        on:input={(e) => (description = e.currentTarget.value)}
        placeholder="A brief description of your extension..."
        rows="3"
        class:warning={getFieldErrors('description').some((e) => e.severity === 'warning')}
      ></textarea>
      {#each getFieldErrors('description') as err}
        <div class="{err.severity}-message">{err.message}</div>
      {/each}
      <div class="help-text">Brief description shown in search results and the Marketplace.</div>
    </div>

    <div class="form-group">
      <label>Categories</label>
      <div class="categories-grid">
        {#each CATEGORIES as category}
          <label class="category-checkbox">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              on:change={() => toggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        {/each}
      </div>
      <div class="help-text">Select categories that describe your extension.</div>
    </div>
  </section>

  <!-- Branding Section -->
  <section class="card">
    <div class="card-header">Branding</div>

    <div class="form-group">
      <label for="icon">Icon Path</label>
      <input
        type="text"
        id="icon"
        value={icon}
        on:blur={() => handleChange('icon', icon)}
        on:input={(e) => (icon = e.currentTarget.value)}
        placeholder="images/icon.png"
        class:warning={getFieldErrors('icon').some((e) => e.severity === 'warning')}
      />
      {#each getFieldErrors('icon') as err}
        <div class="{err.severity}-message">{err.message}</div>
      {/each}
      <div class="help-text">Path to a 128x128 PNG icon relative to the extension root.</div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="galleryBannerColor">Gallery Banner Color</label>
        <div class="color-input-group">
          <input
            type="text"
            id="galleryBannerColor"
            value={galleryBannerColor}
            on:blur={() => handleChange('galleryBanner.color', galleryBannerColor)}
            on:input={(e) => (galleryBannerColor = e.currentTarget.value)}
            placeholder="#000000"
          />
          {#if galleryBannerColor}
            <div
              class="color-preview"
              style="background-color: {galleryBannerColor}"
            ></div>
          {/if}
        </div>
        <div class="help-text">Hex color for the Marketplace banner.</div>
      </div>

      <div class="form-group">
        <label for="galleryBannerTheme">Gallery Banner Theme</label>
        <select
          id="galleryBannerTheme"
          value={galleryBannerTheme}
          on:change={(e) => handleChange('galleryBanner.theme', e.currentTarget.value)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <div class="help-text">Text color theme for the banner.</div>
      </div>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={preview}
          on:change={(e) => handleChange('preview', e.currentTarget.checked)}
        />
        <span>Preview Extension</span>
      </label>
      <div class="help-text">Mark this extension as a preview/beta release.</div>
    </div>
  </section>

  <!-- Keywords Section -->
  <section class="card">
    <div class="card-header">Keywords</div>

    <div class="form-group">
      <label for="keywordsInput">Add Keywords</label>
      <div class="keyword-input-group">
        <input
          type="text"
          id="keywordsInput"
          bind:value={keywordsInput}
          on:keydown={handleKeywordKeydown}
          placeholder="Type a keyword and press Enter"
          disabled={keywords.length >= 30}
        />
        <button
          type="button"
          on:click={addKeyword}
          disabled={!keywordsInput.trim() || keywords.length >= 30}
        >
          Add
        </button>
      </div>
      <div class="help-text">Keywords help users find your extension. Maximum 30 keywords.</div>
    </div>

    {#if keywords.length > 0}
      <div class="keywords-list">
        {#each keywords as keyword}
          <span class="tag">
            {keyword}
            <button
              type="button"
              on:click={() => removeKeyword(keyword)}
              aria-label="Remove {keyword}"
            >
              ×
            </button>
          </span>
        {/each}
      </div>
    {/if}
    <div class="keyword-count">{keywords.length}/30 keywords</div>
  </section>
</div>

<style>
  .metadata-view {
    padding: 20px;
    overflow-y: auto;
    height: 100%;
  }

  h1 {
    margin-bottom: 20px;
    font-size: 1.4em;
  }

  .card {
    margin-bottom: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    margin-top: 8px;
  }

  .category-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .category-checkbox:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .category-checkbox input {
    margin: 0;
  }

  .color-input-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-input-group input {
    flex: 1;
  }

  .color-preview {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid var(--vscode-panel-border);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-bottom: 0;
  }

  .checkbox-label input {
    margin: 0;
  }

  .keyword-input-group {
    display: flex;
    gap: 8px;
  }

  .keyword-input-group input {
    flex: 1;
  }

  .keywords-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .keyword-count {
    margin-top: 8px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
  }

  .error-message {
    color: var(--vscode-errorForeground);
  }

  .warning-message {
    color: var(--vscode-editorWarning-foreground);
  }
</style>
