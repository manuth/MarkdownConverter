// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as VSCode from "vscode";
import * as Path from "path";
import MarkdownFileNotFoundException from "./System/MarkdownFileNotFoundException";
import Program from "./Program";
import Settings from "./Properties/Settings";
import UnauthorizedAccessException from "./System/UnauthorizedAccessException";
import YAMLException from "./System/YAML/YAMLException";
import CultureInfo from "culture-info";
import * as Format from "string-template";
import ResourceManager from "./Properties/ResourceManager";

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
                let markdownDoc = getMarkdownDoc();

                if (markdownDoc)
                {
                    /* Preparing the arguments */
                    let name: string;
                    let base: string;
                    let outDir = Settings.Default.OutputDirectory;

                    if (VSCode.workspace.workspaceFolders && (VSCode.workspace.workspaceFolders.length === 1))
                    {
                        base = VSCode.workspace.workspaceFolders[0].uri.fsPath;
                    }
                    else if (!markdownDoc.isUntitled)
                    {
                        base = Path.dirname(markdownDoc.fileName);
                    }
                    else
                    {
                        base = await VSCode.window.showInputBox({
                            prompt: ResourceManager.Resources.Get("OutDirPrompt"),
                            validateInput: (value: string): any =>
                            {
                                if (!Path.isAbsolute(value))
                                {
                                    return ResourceManager.Resources.Get("OutDirNotAllowed");
                                }
                            }
                        });
                    }

                    if (!Path.isAbsolute(outDir))
                    {
                        outDir = Path.resolve(base, outDir);
                    }

                    if (!markdownDoc.isUntitled)
                    {
                        name = Path.parse(markdownDoc.fileName).name;
                    }
                    else
                    {
                        name = "temp";
                    }

                    let path = process.cwd();
                    {
                        process.chdir(base);

                        /* Executing the main logic */
                        await Program.Main(markdownDoc, Settings.Default.ConversionType, outDir, name);
                    }
                    process.chdir(path);
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