import * as vscode from 'vscode';
import { ManifestEditorProvider } from './editor/ManifestEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(ManifestEditorProvider.register(context));
}

export function deactivate() {}
