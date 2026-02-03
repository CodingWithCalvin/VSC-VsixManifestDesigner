<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/logo.png" alt="VSIX Manifest Designer Logo" width="128" height="128">
</p>

<h1 align="center">VSIX Manifest Designer</h1>

<p align="center">
  <strong>🎨 A visual designer for VS Code extension manifest files</strong>
</p>

<p align="center">
  <a href="https://github.com/CodingWithCalvin/VSC-VsixManifestDesigner/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/CodingWithCalvin/VSC-VsixManifestDesigner?style=for-the-badge" alt="License">
  </a>
  <a href="https://github.com/CodingWithCalvin/VSC-VsixManifestDesigner/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/CodingWithCalvin/VSC-VsixManifestDesigner/ci.yml?style=for-the-badge" alt="Build Status">
  </a>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=CodingWithCalvin.vsix-manifest-designer">
    <img src="https://img.shields.io/visual-studio-marketplace/v/CodingWithCalvin.vsix-manifest-designer?style=for-the-badge" alt="Marketplace Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=CodingWithCalvin.vsix-manifest-designer">
    <img src="https://img.shields.io/visual-studio-marketplace/i/CodingWithCalvin.vsix-manifest-designer?style=for-the-badge" alt="Installs">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=CodingWithCalvin.vsix-manifest-designer">
    <img src="https://img.shields.io/visual-studio-marketplace/d/CodingWithCalvin.vsix-manifest-designer?style=for-the-badge" alt="Downloads">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=CodingWithCalvin.vsix-manifest-designer">
    <img src="https://img.shields.io/visual-studio-marketplace/r/CodingWithCalvin.vsix-manifest-designer?style=for-the-badge" alt="Rating">
  </a>
</p>

---

## 🤔 Why?

Editing VS Code extension manifests (`package.json`) can be tedious. With complex contribution points, activation events, and configuration schemas, it's easy to make mistakes or forget required fields. VSIX Manifest Designer provides a visual interface to edit these files with confidence.

## ✨ Features

- 🎯 **Visual Editor** - Edit your extension manifest visually instead of raw JSON
- 🔄 **Live Sync** - Changes sync bidirectionally between the designer and the underlying JSON
- 🎨 **Theme Integration** - Seamlessly integrates with your VS Code theme
- 📋 **Non-Destructive** - Open alongside the standard JSON editor; your choice

## 🖼️ Screenshots

### Getting Started

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/1-open-with.png" alt="Open With Context Menu" width="400">
  <br>
  <em>Right-click package.json and select "Open With..."</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/2-select-editor.png" alt="Select Editor" width="400">
  <br>
  <em>Choose "Extension Manifest Designer"</em>
</p>

### Editor Views

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/3-metadata.png" alt="Metadata View" width="700">
  <br>
  <em>Metadata - Basic extension information</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/4-activation.png" alt="Activation View" width="700">
  <br>
  <em>Activation - Entry points and activation events</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/5-compatibility.png" alt="Compatibility View" width="700">
  <br>
  <em>Compatibility - VS Code version and runtime settings</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/6-dependencies.png" alt="Dependencies View" width="700">
  <br>
  <em>Dependencies - Extension dependencies and packs</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/7-documentation.png" alt="Documentation View" width="700">
  <br>
  <em>Documentation - Repository, badges, and links</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/8-commands.png" alt="Commands View" width="700">
  <br>
  <em>Commands - Command palette contributions</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/9-configuration.png" alt="Configuration View" width="700">
  <br>
  <em>Configuration - Extension settings schema</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/10-menus.png" alt="Menus View" width="700">
  <br>
  <em>Menus - Menu and context menu contributions</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/11-keybindings.png" alt="Keybindings View" width="700">
  <br>
  <em>Keybindings - Keyboard shortcuts</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/12-view-containers.png" alt="View Containers View" width="700">
  <br>
  <em>View Containers - Activity bar and panel containers</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/13-views.png" alt="Views View" width="700">
  <br>
  <em>Views - Tree views and webviews</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/14-themes.png" alt="Themes View" width="700">
  <br>
  <em>Themes - Color, icon, and product icon themes</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/15-languages.png" alt="Languages View" width="700">
  <br>
  <em>Languages - Language contributions</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/16-grammars.png" alt="Grammars View" width="700">
  <br>
  <em>Grammars - TextMate grammar definitions</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/17-snippets.png" alt="Snippets View" width="700">
  <br>
  <em>Snippets - Code snippet contributions</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodingWithCalvin/VSC-VsixManifestDesigner/main/resources/18-advanced.png" alt="Advanced View" width="700">
  <br>
  <em>Advanced - Localization and lifecycle scripts</em>
</p>

## 🛠️ Installation

### Visual Studio Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "VSIX Manifest Designer"
4. Click Install

### Manual Installation

Download the latest `.vsix` file from the [Releases](https://github.com/CodingWithCalvin/VSC-VsixManifestDesigner/releases) page and install via:

```bash
code --install-extension vsix-manifest-designer-*.vsix
```

## 🚀 Usage

1. Open a folder containing a VS Code extension
2. Right-click on `package.json` in the Explorer
3. Select "Open With..."
4. Choose "Extension Manifest Designer"
5. Edit your manifest visually 🎉

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Run `npm install`
3. Press F5 to launch the Extension Development Host
4. Make changes and test in the development host

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

<!-- readme: contributors -start -->
<!-- readme: contributors -end -->

---

<p align="center">
  Made with ❤️ by <a href="https://codingwithcalvin.net">Coding With Calvin</a>
</p>
