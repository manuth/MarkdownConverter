'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ChildProcess from 'child_process';
import * as Path from 'path';
import * as url from 'url';
import { DateTimeFormatter } from './Core/DateTimeFormatter';
import { Document } from './Document';
import { Footer, Header } from './Section';
import { Converter } from "./Converter";
import { ConversionType, GetExtensions } from "./ConversionType";
import { configKey } from "./Core/Constants";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "markdown-converter" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('markdownConverter.convert', () =>
    {
        // The code you place here will be executed every time your command is executed
        try
        {

            let markdownDoc = getMarkdownDoc();
            let config = vscode.workspace.getConfiguration(configKey);
            let outDir = config.get<string>('outDir');
            let type = config.get('conversionType');

            // ToDo: Validation
            if (vscode.workspace.rootPath)
            {
                process.chdir(vscode.workspace.rootPath);
            }
            else if (outDir)
            {
                process.chdir(outDir);
            }

            if (markdownDoc)
            {
                let name = config.get<string>('document.name');
                let types : ConversionType[] = [ ];
                let doc : Document;

                if (!name)
                {
                    if (!markdownDoc.isUntitled)
                    {
                        name = Path.parse(markdownDoc.fileName).name;
                    }
                    else
                    {
                        name = 'temp';
                    }
                }

                if ((typeof type == 'string'))
                {
                    type = [ type ];
                }
                for (var key in type)
                {
                    types.push(ConversionType[type[key] as string]);
                }

                if (!markdownDoc.isUntitled)
                {
                    if (!Path.isAbsolute(outDir))
                    {
                        outDir = Path.join(Path.dirname(markdownDoc.fileName), outDir);
                    }
                }

                if (markdownDoc.isUntitled || (markdownDoc.isDirty && !config.autoSave))
                {
                    doc = new Document();
                    doc.Content = markdownDoc.getText();
                }
                else
                {
                    if (markdownDoc.isDirty)
                    {
                        markdownDoc.save();
                    }
                    doc = new Document(markdownDoc.fileName);
                }

                let converter = new Converter(doc);
                let Extensions = GetExtensions();

                types.forEach(type => {
                    let destination = Path.join(outDir, name + Extensions[type]);
                    converter.Start(type, destination);
                    vscode.window.showInformationMessage('File successfully converted: [' + destination + ']');
                });
            }
            else
            {
                throw Error('No markdown-file found.');
            }
        }
        catch(e)
        {
            if (e instanceof Error)
            {
                vscode.window.showErrorMessage(e.name + ": " + e.message);
            }
        }
    });

    context.subscriptions.push(disposable);

    /**
     * Tries to find a markdown-file
     */
    function getMarkdownDoc() : vscode.TextDocument
    {
        let config = vscode.workspace.getConfiguration(configKey);
        if (config.has('ignoreLanguage') && config.get<boolean>('ignoreLanguage') && vscode.window.activeTextEditor || vscode.window.activeTextEditor.document.languageId == 'markdown')
        {
            return vscode.window.activeTextEditor.document;
        }
        for (let i = 0; i < vscode.window.visibleTextEditors.length; i++)
        {
            if (vscode.window.visibleTextEditors[i].document.languageId == 'markdown')
            {
                return vscode.window.visibleTextEditors[i].document;
            }
        }
        return null;
    }
}

// this method is called when your extension is deactivated
export function deactivate()
{
}