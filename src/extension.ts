// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import CultureInfo from "culture-info";
import * as FileSystem from "fs-extra";
import * as Path from "path";
import * as Puppeteer from "puppeteer";
import * as Format from "string-template";
import * as VSCode from "vscode";
import Program from "./Program";
import ResourceManager from "./Properties/ResourceManager";
import Settings from "./Properties/Settings";
import Exception from "./System/Exception";
import MarkdownFileNotFoundException from "./System/MarkdownFileNotFoundException";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: VSCode.ExtensionContext)
{
    ResourceManager.Culture = new CultureInfo(VSCode.env.language);

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "markdown-converter" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposables = [
        VSCode.commands.registerCommand("markdownConverter.Convert", async () =>
        {
            if (await FileSystem.pathExists(Puppeteer.executablePath()))
            {
                try
                {
                    let document = getMarkdownDoc();
    
                    /* Preparing the arguments */
                    let documentRoot: string;
                    let outDir = Settings.Default.OutputDirectory;
    
                    let workspace = (VSCode.workspace.workspaceFolders || []).find(
                        (workspaceFolder) => {
                            let workspaceParts = workspaceFolder.uri.fsPath.split(Path.sep);
                            let documentParts = document.uri.fsPath.split(Path.sep);
    
                            return workspaceParts.every(
                                (value, index) =>
                                {
                                    return value === documentParts[index];
                                });
                        });
                    
                    if (workspace)
                    {
                        documentRoot = workspace.uri.fsPath;
                    }
                    else if (!document.isUntitled)
                    {
                        documentRoot = Path.dirname(document.fileName);
                    }
                    else
                    {
                        documentRoot = process.cwd();
                    }
    
                    if (!Path.isAbsolute(outDir))
                    {
                        outDir = Path.resolve(documentRoot, outDir);
                    }
                    
                    await Program.Main(documentRoot, document, Settings.Default.ConversionType, outDir);
                }
                catch (e)
                {
                    let message;
                    
                    if (e instanceof Exception)
                    {
                        message = e.Message;
                    }
                    else
                    {
                        throw e;
                    }
    
                    VSCode.window.showErrorMessage(message);
                }
            }
            else if (
                await VSCode.window.showInformationMessage(
                    ResourceManager.Resources.Get("UpdateMessage"),
                    ResourceManager.Resources.Get<string>("Yes"),
                    ResourceManager.Resources.Get<string>("No")) === ResourceManager.Resources.Get("Yes"))
            {
                let revision = require(Path.join("..", "node_modules", "puppeteer", "package.json")).puppeteer.chromium_revision;
                let promptRetry;

                do
                {
                    promptRetry = false;

                    await VSCode.window.withProgress(
                        {
                            location: VSCode.ProgressLocation.Notification,
                            title: Format(ResourceManager.Resources.Get("UpdateRunning"), revision)
                        }, async (reporter) => {
                            try
                            {
                                let progress = 0;
                                let browserFetcher = (Puppeteer as any).createBrowserFetcher();
                                await browserFetcher.download(
                                    revision,
                                    (downloadedBytes, totalBytes) =>
                                    {
                                        let newProgress = Math.floor((downloadedBytes / totalBytes) * 100);
            
                                        if (newProgress > progress)
                                        {
                                            reporter.report({
                                                increment: newProgress - progress
                                            });
            
                                            progress = newProgress;
                                        }
                                    });

                                VSCode.window.showInformationMessage(ResourceManager.Resources.Get("UpdateSuccess"));
                            }
                            catch
                            {
                                promptRetry = true;
                            }
                        });
                }
                while (
                    !await FileSystem.pathExists(Puppeteer.executablePath()) &&
                    promptRetry &&
                    await VSCode.window.showWarningMessage(
                        ResourceManager.Resources.Get("UpdateFailed"),
                        ResourceManager.Resources.Get("Yes"),
                        ResourceManager.Resources.Get("No")) === ResourceManager.Resources.Get("Yes"));
            }
        })
    ];

    for (let disposable of disposables)
    {
        context.subscriptions.push(disposable);
    }

    /**
     * Tries to find a markdown-file
     */
    function getMarkdownDoc(): VSCode.TextDocument
    {
        if (VSCode.window.activeTextEditor && (VSCode.window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
        {
            return VSCode.window.activeTextEditor.document;
        }
        for (let textEditor of VSCode.window.visibleTextEditors)
        {
            if (textEditor.document.languageId === "markdown")
            {
                return textEditor.document;
            }
        }
        
        throw new MarkdownFileNotFoundException();
    }
}

// this method is called when your extension is deactivated
export function deactivate()
{
}