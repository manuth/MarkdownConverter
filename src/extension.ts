// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { CultureInfo } from "localized-resource-manager";
import { MarkdownIt } from "markdown-it";
import Path = require("path");
import { commands, env, ExtensionContext } from "vscode";
import { ConvertAllTask } from "./ConvertAllTask";
import { ConvertTask } from "./ConvertTask";
import { Resources } from "./Properties/Resources";

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
     * Initializes a new instance of the `Extension` class.
     */
    public constructor()
    {
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
 * The extension itself.
 */
export let extension = new Extension();

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
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");