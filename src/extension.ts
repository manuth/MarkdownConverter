import { CultureInfo } from "localized-resource-manager";
import MarkdownIt = require("markdown-it");
import Path = require("path");
import { commands, env, ExtensionContext, TextEditor, Uri, ViewColumn, window, workspace } from "vscode";
import { Resources } from "./Properties/Resources";
import { ConvertAllTask } from "./Tasks/ConvertAllTask";
import { ConvertTask } from "./Tasks/ConvertTask";

/**
 * Represens the extension itself.
 */
export class Extension
{
    /**
     * The context of the extension.
     */
    private context: ExtensionContext = null;

    /**
     * The parser provided by `Visual Studio Code`
     */
    private vsCodeParser: MarkdownIt = null;

    /**
     * A `TextEditor` which is used for triggering the `extendMarkdownIt`-method.
     */
    private systemParserFixEditor: TextEditor;

    /**
     * A method for resolving the system-parser fix.
     */
    private systemParserFixResolver: () => void;

    /**
     * Initializes a new instance of the `Extension` class.
     */
    public constructor()
    {
        this.systemParserFixResolver = () => { };
        Resources.Culture = new CultureInfo(env.language);
    }

    /**
     * Gets the context of the extension.
     */
    public get Context()
    {
        return this.context;
    }

    /**
     * Gets the parser provided by Visual Studio Code.
     */
    public get VSCodeParser()
    {
        return this.vsCodeParser;
    }

    /**
     * Gets the chromium-revision of the extension.
     */
    public get ChromiumRevision(): string
    {
        return require(Path.join("..", "node_modules", "puppeteer", "package.json"))["puppeteer"]["chromium_revision"];
    }

    /**
     * Activates the extension.
     *
     * @param context
     * A collection of utilities private to an extension.
     */
    public async Activate(context: ExtensionContext)
    {
        this.context = context;

        context.subscriptions.push(
            commands.registerCommand("markdownConverter.Convert", async () => this.Convert()),
            commands.registerCommand("markdownConverter.ConvertAll", async () => this.ConvertAll()));

        return {
            extendMarkdownIt: (md: any) =>
            {
                this.vsCodeParser = md;

                if (window.activeTextEditor === this.systemParserFixEditor)
                {
                    commands.executeCommand("workbench.action.closeActiveEditor");
                }

                this.systemParserFixResolver();

                return md;
            }
        };
    }

    /**
     * Disposes the extension.
     */
    public async Dispose()
    {
    }

    /**
     * Enables the system-parser.
     */
    public async EnableSystemParser()
    {
        let document = await workspace.openTextDocument(Uri.parse("untitled:MarkdownConverter.md"));

        let result = new Promise(
            (resolve) =>
            {
                this.systemParserFixResolver = resolve;
            });

        this.systemParserFixEditor = await window.showTextDocument(
            document,
            {
                viewColumn: ViewColumn.Beside,
                preview: true
            });

        return result;
    }

    /**
     * Converts an opened `TextDocument`.
     */
    protected async Convert()
    {
        await new ConvertTask(this).Execute();
    }

    /**
     * Converts all documents in the workspace.
     */
    protected async ConvertAll()
    {
        await new ConvertAllTask(this).Execute();
    }
}

/**
 * An instance of the extension.
 */
const extension = new Extension();

/**
 * Activates the extension.
 *
 * @param context
 * The context provided by Visual Studio Code.
 */
export let activate = async (context: ExtensionContext) => extension.Activate(context);

/**
 * Deactivates the extension.
 */
export let deactivate = async () => extension.Dispose();