<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from './components/Navigation.svelte';
  import MetadataView from './components/views/MetadataView.svelte';
  import ActivationView from './components/views/ActivationView.svelte';
  import CompatibilityView from './components/views/CompatibilityView.svelte';
  import DependenciesView from './components/views/DependenciesView.svelte';
  import DocumentationView from './components/views/DocumentationView.svelte';
  import CommandsView from './components/views/CommandsView.svelte';
  import ConfigurationView from './components/views/ConfigurationView.svelte';
  import MenusView from './components/views/MenusView.svelte';
  import KeybindingsView from './components/views/KeybindingsView.svelte';
  import ViewContainersView from './components/views/ViewContainersView.svelte';
  import ViewsView from './components/views/ViewsView.svelte';
  import LanguagesView from './components/views/LanguagesView.svelte';
  import GrammarsView from './components/views/GrammarsView.svelte';
  import ThemesView from './components/views/ThemesView.svelte';
  import SnippetsView from './components/views/SnippetsView.svelte';
  import AdvancedView from './components/views/AdvancedView.svelte';
  import {
    manifestStore,
    currentView,
    isLoading,
    parseError,
    isExtension,
    postMessage,
    filePickerResult,
  } from './stores/manifestStore';

  // Handle messages from the extension
  function handleMessage(event: MessageEvent) {
    const message = event.data;

    switch (message.type) {
      case 'update':
        manifestStore.setManifest(
          message.manifest,
          message.detection,
          message.validation,
          message.content
        );
        break;

      case 'parseError':
        manifestStore.setParseError(message.error, message.line, message.column);
        break;

      case 'filePickerResult':
        filePickerResult.set({ field: message.field, path: message.path });
        break;
    }
  }

  // Initialize as extension
  function initializeAsExtension() {
    postMessage({ type: 'initializeAsExtension' });
  }

  // Close and open with default editor
  function closeEditor() {
    postMessage({ type: 'closeEditor' });
  }

  onMount(() => {
    window.addEventListener('message', handleMessage);

    // Tell extension we're ready
    postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });
</script>

<div class="app">
  {#if $isLoading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading manifest...</p>
    </div>
  {:else if $parseError}
    <div class="error-container">
      <div class="error-panel">
        <h2>Parse Error</h2>
        <p class="error-message">{$parseError.error}</p>
        {#if $parseError.line !== undefined}
          <p class="error-location">
            Line {$parseError.line}{$parseError.column !== undefined ? `, Column ${$parseError.column}` : ''}
          </p>
        {/if}
        <p class="error-help">
          Fix the JSON syntax error in the file to continue using the designer.
        </p>
      </div>
    </div>
  {:else if !$isExtension}
    <div class="not-extension-container">
      <div class="not-extension-panel">
        <h2>Not a VS Code Extension</h2>
        <p>This package.json doesn't appear to be a VS Code extension manifest.</p>
        <p>It's missing <code>engines.vscode</code>, <code>contributes</code>, and <code>activationEvents</code>.</p>
        <div class="button-group">
          <button on:click={initializeAsExtension}>Initialize as Extension</button>
          <button class="secondary" on:click={closeEditor}>Open with Default Editor</button>
        </div>
      </div>
    </div>
  {:else}
    <Navigation />
    <main class="content">
      {#if $currentView === 'metadata'}
        <MetadataView />
      {:else if $currentView === 'activation'}
        <ActivationView />
      {:else if $currentView === 'compatibility'}
        <CompatibilityView />
      {:else if $currentView === 'dependencies'}
        <DependenciesView />
      {:else if $currentView === 'documentation'}
        <DocumentationView />
      {:else if $currentView === 'commands'}
        <CommandsView />
      {:else if $currentView === 'configuration'}
        <ConfigurationView />
      {:else if $currentView === 'menus'}
        <MenusView />
      {:else if $currentView === 'keybindings'}
        <KeybindingsView />
      {:else if $currentView === 'viewContainers'}
        <ViewContainersView />
      {:else if $currentView === 'views'}
        <ViewsView />
      {:else if $currentView === 'languages'}
        <LanguagesView />
      {:else if $currentView === 'grammars'}
        <GrammarsView />
      {:else if $currentView === 'themes'}
        <ThemesView />
      {:else if $currentView === 'snippets'}
        <SnippetsView />
      {:else if $currentView === 'advanced'}
        <AdvancedView />
      {/if}
    </main>
  {/if}
</div>

<style>
  .app {
    width: 100%;
    height: 100%;
    display: flex;
  }

  .content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .content > :global(*) {
    width: 100%;
  }

  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--vscode-descriptionForeground);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--vscode-panel-border);
    border-top-color: var(--vscode-progressBar-background);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-container,
  .not-extension-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .error-panel {
    max-width: 500px;
    padding: 24px;
    background-color: var(--vscode-inputValidation-errorBackground);
    border: 1px solid var(--vscode-inputValidation-errorBorder);
    border-radius: 4px;
    text-align: center;
  }

  .error-panel h2 {
    margin-bottom: 12px;
    color: var(--vscode-errorForeground);
  }

  .error-message {
    font-family: var(--vscode-editor-font-family, monospace);
    background-color: var(--vscode-editor-background);
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    word-break: break-word;
  }

  .error-location {
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 12px;
  }

  .error-help {
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
  }

  .not-extension-panel {
    max-width: 500px;
    padding: 24px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    text-align: center;
  }

  .not-extension-panel h2 {
    margin-bottom: 12px;
  }

  .not-extension-panel p {
    margin-bottom: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .not-extension-panel code {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
  }

  .button-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
  }
</style>
