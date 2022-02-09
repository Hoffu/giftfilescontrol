import * as fs from 'fs';
import path = require('path');
import * as vscode from 'vscode';
import { VCSTreeDataProvider, VersionTreeItem } from './versionControlSystem';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "giftfilescontrol" is now active!');
	
	createStatusBarButton(() => {
		const editor = vscode.window.activeTextEditor;
		let newText: string = "";
		vscode.workspace.textDocuments.map((openDoc) => {
			newText += openDoc.getText();
			newText.trim();
			newText += "\n";
		});
		if(editor) {
			editor.edit((editBuilder) => {
				let firstLine = editor.document.lineAt(0);
				let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
				let range = new vscode.Range(firstLine.range.start, lastLine.range.end);
				editBuilder.replace(range, newText);
			});
			vscode.window.showInformationMessage('Files merged successfully.');
		}
	}, 'giftfilescontrol.mergeFiles', `$(files) Merge open GIFT files`, 120, context);

	let lastVersion: number = 0;
	createStatusBarButton(() => {
		const activeEditor = vscode.window.activeTextEditor;
		if(activeEditor) {
			const content = activeEditor.document.getText();
			const filePath = path.join(activeEditor.document.fileName.replace(new RegExp('.gift\$'), '')
				+ '_' + ++lastVersion + '.gift');
			fs.writeFileSync(filePath, content, 'utf8');
			vscode.window.showInformationMessage('( ͡° ͜ʖ ͡°)');
		}
	}, 'giftfilescontrol.saveFile', `$(clone) Save current version`, 130, context);

	const editor = vscode.window.activeTextEditor;
	if(editor) {
		fs.readdir("C:\\Users\\Hoffu\\Downloads", (err, files: string[]) => {
			let paths: string[] = [];
			files.filter((file) => new RegExp('_[0-9]*.gift\$').test(file)).forEach((file) => {
				const uri = vscode.Uri.file(file);
				paths.push(path.join("C:\\Users\\Hoffu\\Downloads", uri.path));
				let splitted = file.replace(/[^0-9_]*/g, '').split('_');
				lastVersion = +splitted[splitted.length - 1] > lastVersion ? +splitted[splitted.length - 1] : lastVersion;
			});
			vscode.window.registerTreeDataProvider('vcs', new VCSTreeDataProvider(paths));
		});		
	}
	const switchVersion = vscode.commands.registerCommand('giftfilescontrol.switchVersion', (item: VersionTreeItem) => {
		const openPath = vscode.Uri.file(item.name);
		vscode.workspace.openTextDocument(openPath).then(doc => {
            const editor = vscode.window.activeTextEditor;
			if(editor) {
				editor.edit((editBuilder) => {
					let firstLine = editor.document.lineAt(0);
					let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
					let range = new vscode.Range(firstLine.range.start, lastLine.range.end);
					editBuilder.replace(range, doc.getText());
				});
				vscode.window.showInformationMessage('Switch to previous version was successful.');
			}
        });
	});
	context.subscriptions.push(switchVersion);
}

export function deactivate() {}

function createStatusBarButton(func: Function, name: string, text: string, priority: number, context: vscode.ExtensionContext): void {
	const command = vscode.commands.registerCommand(name, () => {
		func();
	});
	context.subscriptions.push(command);
	const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority);
	button.command = name;
	button.text = text;
	button.show();
	context.subscriptions.push(button);
}
