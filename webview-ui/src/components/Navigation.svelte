<script lang="ts">
  import { navigationStore, currentView, type ViewType } from '../stores/manifestStore';

  interface NavItem {
    id: ViewType;
    label: string;
    icon: string;
    indent?: boolean;
  }

  interface NavSection {
    title?: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      items: [
        { id: 'metadata', label: 'Metadata', icon: '📋' },
        { id: 'activation', label: 'Activation', icon: '⚡' },
        { id: 'compatibility', label: 'Compatibility', icon: '🔒' },
        { id: 'dependencies', label: 'Dependencies', icon: '🔗' },
        { id: 'documentation', label: 'Documentation', icon: '📖' },
      ],
    },
    {
      title: 'Contributions',
      items: [
        { id: 'commands', label: 'Commands', icon: '▶️' },
        { id: 'configuration', label: 'Configuration', icon: '⚙️' },
        { id: 'menus', label: 'Menus', icon: '📑' },
        { id: 'keybindings', label: 'Keybindings', icon: '⌨️' },
      ],
    },
    {
      title: 'Views & UI',
      items: [
        { id: 'viewContainers', label: 'View Containers', icon: '📦' },
        { id: 'views', label: 'Views', icon: '👁️' },
        { id: 'themes', label: 'Themes', icon: '🎨' },
      ],
    },
    {
      title: 'Languages',
      items: [
        { id: 'languages', label: 'Languages', icon: '🌐' },
        { id: 'grammars', label: 'Grammars', icon: '📝' },
        { id: 'snippets', label: 'Snippets', icon: '✂️' },
      ],
    },
    {
      items: [{ id: 'advanced', label: 'Advanced', icon: '🔧' }],
    },
  ];

  function handleNavClick(id: ViewType) {
    navigationStore.setView(id);
  }

  function handleKeydown(event: KeyboardEvent, id: ViewType) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavClick(id);
    }
  }
</script>

<nav class="navigation">
  <div class="nav-header">
    <h2>Manifest Designer</h2>
  </div>
  <div class="nav-sections" role="tablist" aria-label="Manifest sections">
    {#each navSections as section, sectionIndex}
      {#if section.title}
        <div class="section-title">{section.title}</div>
      {/if}
      <ul class="nav-list">
        {#each section.items as item}
          <li role="presentation">
            <button
              role="tab"
              aria-selected={$currentView === item.id}
              class="nav-item"
              class:active={$currentView === item.id}
              class:indent={section.title}
              on:click={() => handleNavClick(item.id)}
              on:keydown={(e) => handleKeydown(e, item.id)}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
            </button>
          </li>
        {/each}
      </ul>
      {#if sectionIndex < navSections.length - 1}
        <div class="section-divider"></div>
      {/if}
    {/each}
  </div>
</nav>

<style>
  .navigation {
    width: 200px;
    min-width: 200px;
    height: 100%;
    background-color: var(--vscode-sideBar-background);
    border-right: 1px solid var(--vscode-sideBar-border, var(--vscode-panel-border));
    display: flex;
    flex-direction: column;
  }

  .nav-header {
    padding: 16px;
    border-bottom: 1px solid var(--vscode-sideBar-border, var(--vscode-panel-border));
  }

  .nav-header h2 {
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground));
    margin: 0;
  }

  .nav-sections {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .section-title {
    padding: 12px 16px 4px;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-descriptionForeground));
    font-weight: 600;
  }

  .section-divider {
    height: 1px;
    background-color: var(--vscode-sideBar-border, var(--vscode-panel-border));
    margin: 8px 16px;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: none;
    border: none;
    color: var(--vscode-sideBar-foreground, var(--vscode-foreground));
    cursor: pointer;
    text-align: left;
    font-size: inherit;
    transition: background-color 0.1s;
  }

  .nav-item.indent {
    padding-left: 24px;
  }

  .nav-item:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .nav-item:focus {
    outline: none;
    background-color: var(--vscode-list-hoverBackground);
  }

  .nav-item.active {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }

  .nav-item.active:hover {
    background-color: var(--vscode-list-activeSelectionBackground);
  }

  .nav-icon {
    font-size: 1.1em;
    width: 24px;
    text-align: center;
  }

  .nav-label {
    flex: 1;
  }
</style>
