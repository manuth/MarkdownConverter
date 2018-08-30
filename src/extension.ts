// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import CultureInfo from "culture-info";
import * as FileSystem from "fs-extra";
import * as Path from "path";
import * as Puppeteer from "puppeteer";
import * as Format from "string-template";
import { commands, env, ExtensionContext, ProgressLocation, TextDocument, window, workspace } from "vscode";
import { ConvertCommand } from "./MarkdownConverter/ConvertCommand";
import { getMarkdownExtensionContributions } from "./MarkdownConverter/MarkdownExtensions";
import { MarkdownFileNotFoundException } from "./MarkdownConverter/MarkdownFileNotFoundException";
import { Program } from "./Program";
import { ResourceManager } from "./Properties/ResourceManager";
import { Settings } from "./Properties/Settings";
import { Exception } from "./System/Exception";

let markdown;

/**
 * Represens the extension itself.
 */
export class Extension
{
    /**
     * The parser provided by `Visual Studio Code`
     */
    private vsCodeParser;

    /**
     * Initializes a new instance of the `Extension` class.
     */
    public constructor()
    {
        ResourceManager.Culture = new CultureInfo(env.language);
    }

    /**
     * Activates the extension.
     * 
     * @param context
     * A collection of utilities private to an extension.
     */
    public async Activate(context: ExtensionContext)
    {
        // context.subscriptions.push(
        //     commands.registerCommand("markdownConverter.Convert", this.Convert)
        // );
        let disposables = [
            commands.registerCommand("markdownConverter.Convert", async () =>
            {
                if (await FileSystem.pathExists(Puppeteer.executablePath()))
                {
                    try
                    {
                        let document = getMarkdownDoc();
    
                        /* Preparing the arguments */
                        let documentRoot: string;
                        let outDir = Settings.Default.OutputDirectory;
    
                        let currentWorkspace = (workspace.workspaceFolders || []).find(
                            (workspaceFolder) =>
                            {
                                let workspaceParts = workspaceFolder.uri.fsPath.split(Path.sep);
                                let documentParts = document.uri.fsPath.split(Path.sep);
    
                                return workspaceParts.every(
                                    (value, index) =>
                                    {
                                        return value === documentParts[index];
                                    });
                            });
    
                        if (currentWorkspace)
                        {
                            documentRoot = currentWorkspace.uri.fsPath;
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
    
                        await Program.Main(documentRoot, document, Settings.Default.ConversionType, outDir, markdown, getMarkdownExtensionContributions(context));
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
    
                        window.showErrorMessage(message);
                    }
                }
                else if (
                    await window.showInformationMessage(
                        ResourceManager.Resources.Get("UpdateMessage"),
                        ResourceManager.Resources.Get<string>("Yes"),
                        ResourceManager.Resources.Get<string>("No")) === ResourceManager.Resources.Get("Yes"))
                {
                    let revision = require(Path.join("..", "node_modules", "puppeteer", "package.json")).puppeteer.chromium_revision;
                    let promptRetry;
    
                    do
                    {
                        promptRetry = false;
    
                        await window.withProgress(
                            {
                                location: ProgressLocation.Notification,
                                title: Format(ResourceManager.Resources.Get("UpdateRunning"), revision)
                            }, async (reporter) =>
                            {
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
    
                                    window.showInformationMessage(ResourceManager.Resources.Get("UpdateSuccess"));
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
                        await window.showWarningMessage(
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
        function getMarkdownDoc(): TextDocument
        {
            if (window.activeTextEditor && (window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
            {
                return window.activeTextEditor.document;
            }
            for (let textEditor of window.visibleTextEditors)
            {
                if (textEditor.document.languageId === "markdown")
                {
                    return textEditor.document;
                }
            }
    
            throw new MarkdownFileNotFoundException();
        }
    
        return {
            extendMarkdownIt: (md: any) =>
            {
                this.vsCodeParser = md;
                return md;
            }
        };
    }

    /**
     * Converts the current document.
     */
    public async Convert()
    {
        new ConvertCommand(this).Execute();
    }

    /**
     * Disposes the extension.
     */
    public async Dispose()
    {
    }
}

let extension = new Extension();
export let activate = extension.Activate;
export let deactivate = extension.Dispose;