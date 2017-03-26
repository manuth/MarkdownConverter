'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Path from 'path';
import { DateTimeFormatter } from './Core/DateTimeFormatter';
import { Document } from './Document';
import { Footer, Header } from './Section';
import { Converter } from "./Converter";
import { ConversionType } from "./ConversionType";

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
    let disposable = vscode.commands.registerCommand('markdownConverter.convert', async () =>
    {
        // The code you place here will be executed every time your command is executed
        // let markdownDoc = getMarkdownDoc();

        // if (markdownDoc)
        // {
        //     let doc : Document;
        //     if (markdownDoc.isUntitled)
        //     {
        //         doc = new Document();
        //         doc.Content = markdownDoc.getText();
        //     }
        //     else
        //     {
        //         if (markdownDoc.isDirty)
        //         {
        //             markdownDoc.save();
        //         }
        //         doc = new Document(markdownDoc.fileName);
        //     }
        // }
        // else
        // {
        //     throw Error('No markdown-file found.');
        // }
        let doc : Document = new Document();
        doc.SpecialHeaders[3] = new Header('10cm', 'Seite 10');
        doc.StyleSheets.push('../../styles.css');
        doc.Content = '# Hello World\n{{ PageNumber }}\n{{ CreationDate }}';

        var x = new Converter(doc);
        x.Start(ConversionType.PDF, Path.join(__dirname, '..', '..', 'test.pdf'));
        console.log(doc.toJSON());
    });

    context.subscriptions.push(disposable);

    /**
     * Tries to find a markdown-file
     */
    function getMarkdownDoc() : vscode.TextDocument
    {
        if (vscode.window.activeTextEditor.document.languageId == 'markdown')
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