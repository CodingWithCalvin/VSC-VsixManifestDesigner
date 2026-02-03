import * as vscode from 'vscode';
import { getWebviewContent } from '../webview/getWebviewContent';
import { ManifestService, ValidationService } from '../services';
import { VscodeManifest } from '../models';

export class ManifestEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'vsixManifestDesigner.editor';

  private readonly manifestService = new ManifestService();
  private readonly validationService = new ValidationService();

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ManifestEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      ManifestEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewPanel.webview.html = getWebviewContent(
      webviewPanel.webview,
      this.context.extensionUri
    );

    // Track formatting options for round-trip preservation
    let indentation = '  ';
    let trailingNewline = true;

    const updateWebview = () => {
      const content = document.getText();
      const parseResult = this.manifestService.parse(content);

      if (parseResult.success) {
        indentation = parseResult.indentation;
        trailingNewline = parseResult.trailingNewline;

        const detection = this.manifestService.detectExtension(parseResult.manifest);
        const validation = this.validationService.validate(parseResult.manifest);

        webviewPanel.webview.postMessage({
          type: 'update',
          content: content,
          manifest: parseResult.manifest,
          detection: detection,
          validation: validation,
        });
      } else {
        webviewPanel.webview.postMessage({
          type: 'parseError',
          error: parseResult.error,
          line: parseResult.line,
          column: parseResult.column,
        });
      }
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'ready':
          updateWebview();
          break;

        case 'edit':
          await this.applyEdit(document, message.content);
          break;

        case 'updateManifest':
          await this.updateManifest(document, message.updates, indentation, trailingNewline);
          break;

        case 'initializeAsExtension':
          await this.initializeAsExtension(document, indentation, trailingNewline);
          break;

        case 'closeEditor':
          // Close this editor and open with default editor
          const uri = document.uri;
          await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
          await vscode.commands.executeCommand('vscode.open', uri);
          break;

        case 'pickFile':
          await this.handleFilePicker(
            webviewPanel.webview,
            document,
            message.field,
            message.filters
          );
          break;
      }
    });

    updateWebview();
  }

  private async applyEdit(document: vscode.TextDocument, newContent: string): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      newContent
    );
    await vscode.workspace.applyEdit(edit);
  }

  private async updateManifest(
    document: vscode.TextDocument,
    updates: Partial<VscodeManifest>,
    indentation: string,
    trailingNewline: boolean
  ): Promise<void> {
    const content = document.getText();
    const parseResult = this.manifestService.parse(content);

    if (!parseResult.success) {
      vscode.window.showErrorMessage(`Cannot update manifest: ${parseResult.error}`);
      return;
    }

    const updatedManifest = this.manifestService.update(parseResult.manifest, updates);
    const newContent = this.manifestService.serialize(updatedManifest, {
      indentation,
      trailingNewline,
    });

    await this.applyEdit(document, newContent);
  }

  private async initializeAsExtension(
    document: vscode.TextDocument,
    indentation: string,
    trailingNewline: boolean
  ): Promise<void> {
    const content = document.getText();
    const parseResult = this.manifestService.parse(content);

    if (!parseResult.success) {
      vscode.window.showErrorMessage(`Cannot initialize: ${parseResult.error}`);
      return;
    }

    const extensionManifest = this.manifestService.initializeAsExtension(parseResult.manifest);
    const newContent = this.manifestService.serialize(extensionManifest, {
      indentation,
      trailingNewline,
    });

    await this.applyEdit(document, newContent);
  }

  private async handleFilePicker(
    webview: vscode.Webview,
    document: vscode.TextDocument,
    field: string,
    filters?: Record<string, string[]>
  ): Promise<void> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const defaultUri = workspaceFolder?.uri || vscode.Uri.file(document.uri.fsPath);

    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Select',
      defaultUri,
    };

    if (filters) {
      options.filters = filters;
    }

    const result = await vscode.window.showOpenDialog(options);

    if (result && result.length > 0) {
      const selectedUri = result[0];
      // Convert to relative path from the package.json location
      let relativePath = vscode.workspace.asRelativePath(selectedUri, false);

      // Ensure the path starts with ./
      if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
        relativePath = './' + relativePath;
      }

      webview.postMessage({
        type: 'filePickerResult',
        field,
        path: relativePath,
      });
    }
  }
}
