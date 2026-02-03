<script lang="ts">
  import { manifest, manifestStore } from '../../stores/manifestStore';

  interface Badge {
    url: string;
    href: string;
    description: string;
  }

  interface Repository {
    type?: string;
    url: string;
  }

  $: repository = $manifest?.repository as Repository | string | undefined;
  $: repositoryUrl = typeof repository === 'string' ? repository : repository?.url || '';
  $: repositoryType = typeof repository === 'object' ? repository?.type || 'git' : 'git';
  $: bugsUrl = ($manifest?.bugs as { url?: string })?.url || '';
  $: homepage = ($manifest?.homepage as string) || '';
  $: license = ($manifest?.license as string) || '';
  $: badges = ($manifest?.badges as Badge[]) || [];
  $: sponsorUrl = ($manifest?.sponsor as { url?: string })?.url || '';
  $: qna = $manifest?.qna as string | boolean | undefined;

  let newBadge: Badge = { url: '', href: '', description: '' };

  function handleRepositoryChange(field: 'url' | 'type', value: string) {
    if (field === 'url') {
      if (!value) {
        manifestStore.updateField('repository', undefined as unknown as string);
        return;
      }
      // Use object format if we have a type other than git, otherwise simple string
      if (repositoryType === 'git') {
        manifestStore.updateField('repository', value);
      } else {
        manifestStore.updateField('repository', { type: repositoryType, url: value });
      }
    } else {
      if (!repositoryUrl) return;
      if (value === 'git') {
        manifestStore.updateField('repository', repositoryUrl);
      } else {
        manifestStore.updateField('repository', { type: value, url: repositoryUrl });
      }
    }
  }

  function handleBugsChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('bugs', { url: value });
    } else {
      manifestStore.updateField('bugs', undefined as unknown as { url: string });
    }
  }

  function handleHomepageChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('homepage', value);
    } else {
      manifestStore.updateField('homepage', undefined as unknown as string);
    }
  }

  function handleLicenseChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('license', value);
    } else {
      manifestStore.updateField('license', undefined as unknown as string);
    }
  }

  function handleSponsorChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value) {
      manifestStore.updateField('sponsor', { url: value });
    } else {
      manifestStore.updateField('sponsor', undefined as unknown as { url: string });
    }
  }

  function handleQnaChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    if (value === 'marketplace') {
      manifestStore.updateField('qna', 'marketplace');
    } else if (value === 'false') {
      manifestStore.updateField('qna', false);
    } else if (value === '') {
      manifestStore.updateField('qna', undefined as unknown as string);
    } else {
      manifestStore.updateField('qna', value);
    }
  }

  function handleRepoUrlChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    handleRepositoryChange('url', value);
  }

  function handleRepoTypeChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    handleRepositoryChange('type', value);
  }

  function handleAddBadge() {
    if (!newBadge.url || !newBadge.href || !newBadge.description) return;

    const newBadges = [...badges, { ...newBadge }];
    manifestStore.updateField('badges', newBadges);
    newBadge = { url: '', href: '', description: '' };
  }

  function handleRemoveBadge(index: number) {
    const newBadges = badges.filter((_, i) => i !== index);
    if (newBadges.length > 0) {
      manifestStore.updateField('badges', newBadges);
    } else {
      manifestStore.updateField('badges', undefined as unknown as Badge[]);
    }
  }

  </script>

<div class="documentation-view">
  <h1>Documentation</h1>
  <p class="description">
    Configure repository links, badges, and other documentation-related settings.
  </p>

  <section class="card">
    <div class="card-header">Repository</div>
    <div class="card-content">
      <div class="form-row">
        <div class="form-group flex-1">
          <label for="repo-url">Repository URL</label>
          <input
            id="repo-url"
            type="text"
            value={repositoryUrl}
            on:change={handleRepoUrlChange}
            placeholder="https://github.com/username/repo"
          />
        </div>
        <div class="form-group">
          <label for="repo-type">Type</label>
          <select
            id="repo-type"
            value={repositoryType}
            on:change={handleRepoTypeChange}
          >
            <option value="git">git</option>
            <option value="svn">svn</option>
            <option value="hg">hg</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Links</div>
    <div class="card-content">
      <div class="form-group">
        <label for="bugs-url">Bug Tracker URL</label>
        <input
          id="bugs-url"
          type="text"
          value={bugsUrl}
          on:change={handleBugsChange}
          placeholder="https://github.com/username/repo/issues"
        />
        <span class="field-hint">Where users can report bugs</span>
      </div>

      <div class="form-group">
        <label for="homepage">Homepage</label>
        <input
          id="homepage"
          type="text"
          value={homepage}
          on:change={handleHomepageChange}
          placeholder="https://example.com/my-extension"
        />
        <span class="field-hint">Extension documentation or landing page</span>
      </div>

      <div class="form-group">
        <label for="sponsor">Sponsor URL</label>
        <input
          id="sponsor"
          type="text"
          value={sponsorUrl}
          on:change={handleSponsorChange}
          placeholder="https://github.com/sponsors/username"
        />
        <span class="field-hint">Link to sponsor/donate page (shown on Marketplace)</span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">License</div>
    <div class="card-content">
      <div class="form-group">
        <label for="license">License</label>
        <input
          id="license"
          type="text"
          value={license}
          on:change={handleLicenseChange}
          placeholder="MIT"
        />
        <span class="field-hint">SPDX license identifier (e.g., MIT, Apache-2.0, GPL-3.0, BSD-3-Clause)</span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Q&A</div>
    <div class="card-content">
      <div class="form-group">
        <label for="qna">Q&A Link</label>
        <select id="qna" value={qna === false ? 'false' : qna || ''} on:change={handleQnaChange}>
          <option value="">Default (Marketplace Q&A)</option>
          <option value="marketplace">Marketplace Q&A</option>
          <option value="false">Disabled</option>
        </select>
        <span class="field-hint">Where users can ask questions. Leave default for Marketplace Q&A section.</span>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">Badges</div>
    <div class="card-content">
      <p class="section-description">
        Add badges to display on your Marketplace page (build status, version, etc.)
      </p>

      <div class="badges-list">
        {#if badges.length === 0}
          <p class="empty-message">No badges defined.</p>
        {:else}
          {#each badges as badge, index}
            <div class="badge-item">
              <div class="badge-preview">
                <img src={badge.url} alt={badge.description} />
              </div>
              <div class="badge-details">
                <div class="badge-description">{badge.description}</div>
                <div class="badge-url">{badge.href}</div>
              </div>
              <button class="remove-btn" on:click={() => handleRemoveBadge(index)} title="Remove">×</button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="add-badge-section">
        <div class="add-badge-header">Add Badge</div>
        <div class="form-group">
          <label for="badge-url">Image URL</label>
          <input
            id="badge-url"
            type="text"
            bind:value={newBadge.url}
            placeholder="https://img.shields.io/badge/..."
          />
        </div>
        <div class="form-group">
          <label for="badge-href">Link URL</label>
          <input
            id="badge-href"
            type="text"
            bind:value={newBadge.href}
            placeholder="https://github.com/username/repo/actions"
          />
        </div>
        <div class="form-group">
          <label for="badge-description">Description</label>
          <input
            id="badge-description"
            type="text"
            bind:value={newBadge.description}
            placeholder="Build Status"
          />
        </div>
        <button
          class="add-btn"
          on:click={handleAddBadge}
          disabled={!newBadge.url || !newBadge.href || !newBadge.description}
        >
          Add Badge
        </button>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3>Badge Services</h3>
    <ul>
      <li><a href="https://shields.io" target="_blank">Shields.io</a> - Custom badges for any service</li>
      <li><a href="https://badgen.net" target="_blank">Badgen</a> - Fast badge generating service</li>
      <li>GitHub Actions badges: <code>https://github.com/USER/REPO/actions/workflows/FILE/badge.svg</code></li>
    </ul>

    <h3>Common Badge Examples</h3>
    <ul>
      <li>VS Code Marketplace Version: <code>https://img.shields.io/vscode-marketplace/v/PUBLISHER.EXTENSION</code></li>
      <li>Installs: <code>https://img.shields.io/vscode-marketplace/i/PUBLISHER.EXTENSION</code></li>
      <li>Rating: <code>https://img.shields.io/vscode-marketplace/r/PUBLISHER.EXTENSION</code></li>
    </ul>
  </section>
</div>

<style>
  .documentation-view {
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
    width: 100%;
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

  .form-row {
    display: flex;
    gap: 16px;
  }

  .flex-1 {
    flex: 1;
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

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 6px 8px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    border-radius: 2px;
  }

  .form-group select {
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border-color: var(--vscode-dropdown-border, var(--vscode-panel-border));
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
  }

  .badges-list {
    margin-bottom: 16px;
  }

  .empty-message {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    margin: 0;
  }

  .badge-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .badge-preview {
    flex-shrink: 0;
  }

  .badge-preview img {
    max-height: 20px;
    display: block;
  }

  .badge-details {
    flex: 1;
    min-width: 0;
  }

  .badge-description {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .badge-url {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .add-badge-section {
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 4px;
  }

  .add-badge-header {
    font-weight: 500;
    margin-bottom: 12px;
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

  .help-section {
    width: 100%;
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
