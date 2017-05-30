'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as VSCode from 'vscode';
import * as Path from 'path';
import * as ChildProcess from 'child_process';
import { ConversionType } from "./Core/ConversionType";
import { ConfigKey } from "./Core/Constants";
import { MarkdownFileNotFoundException } from "./Core/MarkdownFileNotFoundException";
import * as NLS from 'vscode-nls';
import * as NPM from 'npm';
import * as PhantomJS from 'phantomjs-prebuilt';
import { ProcessException } from './Core/ProcessException';
import { Program } from "./Program";
import * as Shell from 'shelljs';
import { UnauthorizedAccessException } from "./Core/UnauthorizedAccessException";
import { YAMLException } from "./Core/YAMLException";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: VSCode.ExtensionContext)
{
    // Gets a value indicating whether phantomjs could be built.
    let phantomJSBuilt = null;
    let localize : any = NLS.config({ locale: VSCode.env.language })(Path.join(__dirname, '..', '..', 'Resources', 'Localization', 'MarkdownConverter'));

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "markdown-converter" is now active!');

    // Rebuilding PhantomJS if required.
    if (PhantomJS.platform != process.platform)
    {
        try
        {
            let env = process.env;
            env['PHANTOMJS_PLATFORM'] = process.platform;
            env['PHANTOMJS_ARCH'] = process.arch;
            VSCode.window.showInformationMessage(localize(2 /* UpdateMessage */, null));
            process.chdir(Path.join(__dirname, '..', '..'));
            
            ChildProcess.exec(
                'npm --strict-ssl false rebuild phantomjs-prebuilt',
                {
                    env: env
                }, function (error, stdout, stderr)
                {
                    if (!error && !stderr)
                    {
                        phantomJSBuilt = true;
                        VSCode.window.showInformationMessage(localize(3 /* PhantomJSRebuildMessage */, null));
                    }
                    else
                    {
                        throw new ProcessException('', stdout, stderr, error);
                    }
                });
        }
        catch (e)
        {
            VSCode.window.showErrorMessage(localize(8 /* PhantomJSRebuildException */, null));
            phantomJSBuilt = false;
        }
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = VSCode.commands.registerCommand('markdownConverter.convert', () =>
    {
        // The code you place here will be executed every time your command is executed
        if (PhantomJS.platform != process.platform && phantomJSBuilt !== null)
        {
            if (phantomJSBuilt)
            {
                VSCode.window.showInformationMessage(localize(3 /* PhantomJSRebuildMessage */, null));
            }
            else
            {
                VSCode.window.showWarningMessage(localize(8 /* PhantomJSRebuildException */, null));
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
                    let config = VSCode.workspace.getConfiguration(ConfigKey);
                    let outDir = config.get<string>('outDir');
                    let workDir = config.get<string>('workDir');
                    let type = config.get('conversionType');
                    let name = config.get<string>('document.name');
                    let autoSave = config.get<boolean>('autoSave');
                    let types : ConversionType[] = [ ];
                    let base : string;

                    if (VSCode.workspace.rootPath)
                    {
                        base = VSCode.workspace.rootPath;
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
                    message = localize(5 /* UnauthorizedAccessException */, null, e.Path);
                }
                else if (e instanceof YAMLException)
                {
                    message = localize(7 /* YAMLException */, null, e.mark.line + 1, e.mark.column);
                }
                else if (e instanceof Error)
                {
                    message = localize(4 /* UnknownException */, null, e.name, e.message);
                }
                VSCode.window.showErrorMessage(message);
            }
        }
    });

    context.subscriptions.push(disposable);

    /**
     * Tries to find a markdown-file
     */
    function getMarkdownDoc() : VSCode.TextDocument
    {
        let config = VSCode.workspace.getConfiguration(ConfigKey);
        if (VSCode.window.activeTextEditor && (VSCode.window.activeTextEditor.document.languageId == 'markdown' || (config.has('ignoreLanguage') && config.get<boolean>('ignoreLanguage'))))
        {
            return VSCode.window.activeTextEditor.document;
        }
        for (let i = 0; i < VSCode.window.visibleTextEditors.length; i++)
        {
            if (VSCode.window.visibleTextEditors[i].document.languageId == 'markdown')
            {
                return VSCode.window.visibleTextEditors[i].document;
            }
        }
        return null;
    }
}

// this method is called when your extension is deactivated
export function deactivate()
{
}