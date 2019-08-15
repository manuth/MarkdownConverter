import Path = require("path");
import { commands, ExtensionContext } from "vscode";
import { Extension } from "./System/Extensibility/Extension";
import { ChainTask } from "./Tasks/ChainTask";
import { ConvertAllTask } from "./Tasks/ConvertAllTask";
import { ConvertTask } from "./Tasks/ConvertTask";

/**
 * Represents the `Markdown Converter` extension.
 */
export class MarkdownConverterExtension extends Extension
{
    /**
     * Gets the chromium-revision of the extension.
     */
    public get ChromiumRevision(): string
    {
        return require(Path.join(__dirname, "..", "node_modules", "puppeteer", "package.json"))["puppeteer"]["chromium_revision"];
    }

    /**
     * @inheritdoc
     */
    public async Activate(context: ExtensionContext)
    {
        context.subscriptions.push(
            commands.registerCommand("markdownConverter.Convert", async () => this.ExecuteTask(new ConvertTask(this))),
            commands.registerCommand("markdownConverter.ConvertAll", async () => this.ExecuteTask(new ConvertAllTask(this))),
            commands.registerCommand("markdownConverter.Chain", async () => this.ExecuteTask(new ChainTask(this))));

        return super.Active(context);
    }
}