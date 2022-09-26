import { createRequire } from "module";
import { Package } from "@manuth/package-json-editor";
import { CultureInfo } from "@manuth/resource-manager";
import MarkdownIt from "markdown-it";
import format from "string-template";
import path from "upath";
import vscode from "vscode";
import { Resources } from "../../Properties/Resources.js";
import { Task } from "../Tasks/Task.js";
import { IExtension } from "./IExtension.cjs";

const { dirname } = path;
const { commands, env, ProgressLocation, ViewColumn, window, workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Represents an extension.
 */
export class Extension implements IExtension
{
    /**
     * The meta-data of the extension.
     */
    private metaData: Package;

    /**
     * The parser provided by `vscode`.
     */
    private vsCodeParser: MarkdownIt;

    /**
     * A {@link Promise `Promise`} for waiting for the system-parser to be fixed.
     */
    private systemParserFixPromise: Promise<void>;

    /**
     * A method for resolving the system-parser fix.
     */
    private systemParserFixResolver: () => void;

    /**
     * Initializes a new instance of the {@link Extension `Extension`} class.
     *
     * @param extensionPackage
     * The package of the extension.
     */
    public constructor(extensionPackage: Package)
    {
        this.metaData = extensionPackage;

        this.systemParserFixPromise = new Promise(
            (resolve) =>
            {
                this.systemParserFixResolver = resolve;
            });

        Resources.Culture = new CultureInfo(env.language);
    }

    /**
     * @inheritdoc
     */
    public get ExtensionRoot(): string
    {
        return dirname(this.MetaData.FileName);
    }

    /**
     * Gets the meta-data of the extension.
     */
    public get MetaData(): Package
    {
        return this.metaData;
    }

    /**
     * @inheritdoc
     */
    public get Author(): string
    {
        return this.MetaData.AdditionalProperties.Get("publisher") as string;
    }

    /**
     * @inheritdoc
     */
    public get Name(): string
    {
        return this.MetaData.Name;
    }

    /**
     * @inheritdoc
     */
    public get FullName(): string
    {
        return `${this.Author}.${this.Name}`;
    }

    /**
     * @inheritdoc
     */
    public get VSCodeParser(): MarkdownIt
    {
        return this.vsCodeParser;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The extension-body.
     */
    public async Activate(): Promise<unknown>
    {
        return {
            extension: this,
            extendMarkdownIt: (md: any) =>
            {
                this.vsCodeParser = md;
                this.resolveFix();
                return md;
            }
        };
    }

    /**
     * @inheritdoc
     */
    public async Dispose(): Promise<void>
    { }

    /**
     * @inheritdoc
     */
    public async EnableSystemParser(): Promise<void>
    {
        if (!this.VSCodeParser)
        {
            await window.showTextDocument(
                await workspace.openTextDocument(
                    {
                        language: "md",
                        content: ""
                    }),
                {
                    viewColumn: ViewColumn.Beside,
                    preview: true
                });

            await commands.executeCommand("markdown.showPreview");
            await commands.executeCommand("workbench.action.closeActiveEditor");
            await commands.executeCommand("workbench.action.closeActiveEditor");
        }

        return this.systemParserFixPromise;
    }

    /**
     * Executes a task.
     *
     * @param task
     * The task to execute.
     */
    protected async ExecuteTask(task: Task): Promise<void>
    {
        try
        {
            await this.ExecuteTaskInternal(task);
        }
        catch (exception)
        {
            let message: string;

            if (exception instanceof Error)
            {
                message = format(Resources.Resources.Get("UnknownException"), exception.name, exception.message);
            }
            else
            {
                message = format(Resources.Resources.Get("UnknownError"), exception);
            }

            window.showErrorMessage(message);
        }
    }

    /**
     * Executes a task.
     *
     * @param task
     * The task to execute.
     */
    protected async ExecuteTaskInternal(task: Task): Promise<void>
    {
        return window.withProgress(
            {
                cancellable: task.Cancellable,
                location: ProgressLocation.Notification,
                title: task.Title
            },
            async (progressReporter, cancellationToken) =>
            {
                await task.Execute(progressReporter, cancellationToken);
            });
    }

    /**
     * Resolves the system-parser fix.
     */
    private resolveFix(): void
    {
        this.systemParserFixResolver();
    }
}
