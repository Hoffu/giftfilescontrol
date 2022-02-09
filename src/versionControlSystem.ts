import * as vscode from 'vscode';

export class VCSTreeDataProvider implements vscode.TreeDataProvider<VersionTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<VersionTreeItem | undefined | void> = new vscode.EventEmitter<VersionTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<VersionTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  data: VersionTreeItem[] = [];

  constructor(files: string[]) {
    this.updateData(files);
  }

  refresh(): void {
		this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: VersionTreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: VersionTreeItem|undefined): vscode.ProviderResult<VersionTreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  updateData(files: string[]): void {
    this.data = [];
    let count: number = 0;
    files.map((file) => {
        console.log(file);
        const openPath = vscode.Uri.file(file);
        vscode.workspace.openTextDocument(openPath).then(doc => {
            this.data.push(new VersionTreeItem('Версия №' + ++count, [new VersionTreeItem(doc.fileName)]));
        });
    });
  }
}

export class VersionTreeItem extends vscode.TreeItem {
  children: VersionTreeItem[]|undefined;
  name: string;

  command = {
    "title": "Switch file version",
    "command": "giftfilescontrol.switchVersion",
    "arguments": [this]
  }

  constructor(label: string, children?: VersionTreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.name = label;
  }
}