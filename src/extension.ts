// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import CultureInfo from "culture-info";
import { MarkdownIt } from "markdown-it";
import { commands, env, ExtensionContext } from "vscode";
import { ConvertCommand } from "./MarkdownConverter/ConvertCommand";
import { ResourceManager } from "./Properties/ResourceManager";

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
        ResourceManager.Culture = new CultureInfo(env.language);
    }

    /**
     * Gets the context of the extension.
     */
    public get Context()
    {
        return this.context;
    }

    /**
     * Gets the parser provided by 
     */
    public get VSCodeParser()
    {
        return this.vsCodeParser;
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
            commands.registerCommand("markdownConverter.Convert", async () => await this.Convert()));

        return {
            extendMarkdownIt: (md: any) =>
            {
                this.vsCodeParser = md;
                return md;
            }
        };
    }

    /**
     * Converts an opened `TextDocument`.
     */
    protected async Convert()
    {
        await new ConvertCommand(this).Execute();
    }

    /**
     * Disposes the extension.
     */
    public async Dispose()
    {
    }
}

let extension = new Extension();
export let activate = async (context: ExtensionContext) => await extension.Activate(context);
export let deactivate = async () => await extension.Dispose();