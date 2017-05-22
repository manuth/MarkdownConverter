'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Path from 'path';
import { ConversionType } from "./Core/ConversionType";
import { ConfigKey } from "./Core/Constants";
import { MarkdownFileNotFoundException } from "./Core/MarkdownFileNotFoundException";
import * as NLS from 'vscode-nls';
import * as PhantomJS from 'phantomjs-prebuilt';
import { Program } from "./Program";
import * as Shell from 'shelljs';
import { UnauthorizedAccessException } from "./Core/UnauthorizedAccessException";
import { YAMLException } from "./Core/YAMLException";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    // Gets a value indicating whether phantomjs could be built.
    let phantomJSBuilt = true;
    let localize : any = NLS.config({ locale: vscode.env.language })(Path.join(__dirname, '..', '..', 'Resources', 'Localization', 'MarkdownConverter'));

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "markdown-converter" is now active!');

    // Rebuilding PhantomJS if required.
    if (PhantomJS.platform != process.platform)
    {
        try
        {
            let result = Shell.exec('npm rebuild phantomjs-prebuilt', { cwd: Path.join(__dirname, '..', '..') });

            if (result.stderr)
            {
                throw new Error(result.stderr.toString());
            }

            vscode.window.showInformationMessage(localize(2 /* PhantomRebuildMessage */, null));
        }
        catch (e)
        {
            vscode.window.showErrorMessage(localize(7 /* PhantomRebuildException */, null));
            phantomJSBuilt = false;
        }
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('markdownConverter.convert', () =>
    {
        // The code you place here will be executed every time your command is executed
        if (PhantomJS.platform != process.platform)
        {
            if (phantomJSBuilt)
            {
                vscode.window.showInformationMessage(localize(2 /* PhantomRebuildMessage */, null));
            }
            else
            {
                vscode.window.showWarningMessage(localize(7 /* PhantomRebuildException */, null));
            }
        }
        else
        {
            try
            {
                let markdownDoc = getMarkdownDoc();

                if (markdownDoc)
                {
                    /* Preparing the arguments */
                    let config = vscode.workspace.getConfiguration(ConfigKey);
                    let outDir = config.get<string>('outDir');
                    let workDir = config.get<string>('workDir');
                    let type = config.get('conversionType');
                    let name = config.get<string>('document.name');
                    let autoSave = config.get<boolean>('autoSave');
                    let types : ConversionType[] = [ ];
                    let base : string;

                    if (vscode.workspace.rootPath)
                    {
                        base = vscode.workspace.rootPath;
                    }
                    else
                    {
                        base = process.cwd();
                    }

                    if (!Path.isAbsolute(workDir))
                    {
                        workDir = Path.resolve(base, workDir);
                    }
                    
                    process.chdir(workDir);

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

                    if (markdownDoc.isUntitled)
                    {
                        if (!Path.isAbsolute(outDir))
                        {
                            outDir = Path.resolve(process.cwd(), outDir);
                        }
                    }
                    else
                    {
                        if (!Path.isAbsolute(outDir))
                        {
                            outDir = Path.resolve(Path.dirname(markdownDoc.fileName), outDir);
                        }
                    }

                    /* Executing the main logic */
                    Program.Main(markdownDoc, types, outDir, name, autoSave);
                }
                else
                {
                    throw new MarkdownFileNotFoundException();
                }
            }
            catch(e)
            {
                let message;
                
                if (e instanceof UnauthorizedAccessException)
                {
                    message = localize(4 /* "UnauthorizedAccessException" */, null, e.Path);
                }
                else if (e instanceof YAMLException)
                {
                    message = localize(6 /* "YAMLException" */, null, e.mark.line + 1, e.mark.column);
                }
                else if (e instanceof Error)
                {
                    message = localize(3 /* "UnknownException" */, null, e.name, e.message);
                }
                vscode.window.showErrorMessage(message);
            }
        }
    });

    context.subscriptions.push(disposable);

    /**
     * Tries to find a markdown-file
     */
    function getMarkdownDoc() : vscode.TextDocument
    {
        let config = vscode.workspace.getConfiguration(ConfigKey);
        if (vscode.window.activeTextEditor && (vscode.window.activeTextEditor.document.languageId == 'markdown' || (config.has('ignoreLanguage') && config.get<boolean>('ignoreLanguage'))))
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