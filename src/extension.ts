/**
 * 代码参考 https://github.dev/JakHuang/form-generator-plugin
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import* as fs from 'fs';
import path = require('path');

const templatePath = 'src/view/index.html';

/**
 * 读取模板
 * @param context 
 */
function getWebviewContent(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage(templatePath);

	const resourcePath = path.join(context.extensionPath, templatePath);
	const html = fs.readFileSync(resourcePath, 'utf8');
	return html;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('corgi-lowcode.open', (url) => {
		if (!url) {
			vscode.window.showErrorMessage('无法获取文件夹路径');
		}

		let filePath = url.fsPath,
				stat = fs.lstatSync(filePath);
		// 如果地址是个文件， 则保存文当前文件的所在目录
		if (stat.isFile()) {filePath = path.dirname(filePath);}

		/**
		 * 默认出现在startsBar左侧
		 */
		let startsBarItem = vscode.window.createStatusBarItem();
		startsBarItem.text = `选中文件夹：${filePath}`;
		startsBarItem.show();

		const panel = vscode.window.createWebviewPanel(
			'corgi-lowcode',
			'Corgi-Lowcode',
			vscode.ViewColumn.One,
			{
				enableScripts: true, // 启用JS，默认禁用
				retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
			}
		);
		
		/**
		 * 监听页面显示状态，决定是否展示startsBarItem
		 */
		panel.onDidChangeViewState(() => {
			if (panel.visible) {
				startsBarItem.show();
			} else {
				startsBarItem.hide();
			}
		});

		panel.webview.html = getWebviewContent(context);

		// 销毁
		panel.onDidDispose(() => {
			startsBarItem.dispose();
		});

	}));
}