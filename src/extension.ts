// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import CultureInfo from "culture-info";
import * as Path from "path";
import * as Format from "string-template";
import * as VSCode from "vscode";
import Program from "./Program";
import ResourceManager from "./Properties/ResourceManager";
import Settings from "./Properties/Settings";
import MarkdownFileNotFoundException from "./System/MarkdownFileNotFoundException";
import UnauthorizedAccessException from "./System/UnauthorizedAccessException";
import YAMLException from "./System/YAML/YAMLException";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: VSCode.ExtensionContext)
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
            try
            {
                let document = getMarkdownDoc();

                if (document)
                {
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
                else
                {
                    throw new MarkdownFileNotFoundException();
                }
            }
            catch (e)
            {
                let message;

                if (e instanceof UnauthorizedAccessException)
                {
                    message = ResourceManager.Resources.Get("UnauthorizedAccessException");
                }
                else if (e instanceof YAMLException)
                {
                    message = Format(ResourceManager.Resources.Get("YAMLException"), e.Mark.line + 1, e.Mark.column);
                }
                else if (e instanceof Error)
                {
                    throw e;
                }
                VSCode.window.showErrorMessage(message);
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
        return null;
    }
}

// this method is called when your extension is deactivated
export function deactivate()
{
}