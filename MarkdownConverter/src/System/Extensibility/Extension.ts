import { CultureInfo } from "culture-info";
import MarkdownIt = require("markdown-it");
import Path = require("path");
import PkgUp = require("pkg-up");
import Format = require("string-template");
import { isNullOrUndefined } from "util";
import { commands, env, ExtensionContext, ProgressLocation, TextEditor, Uri, ViewColumn, window, workspace } from "vscode";
import { Resources } from "../../Properties/Resources";
import { Task } from "../Tasks/Task";

/**
 * Represents an extension.
 */
export class Extension
{
    /**
     * The context of the extension.
     */
    private context: ExtensionContext = null;

    /**
     * The path to the root of the extension.
     */
    private extensionRoot: string;

    /**
     * The meta-data of the extension.
     */
    private metaData: any;

    /**
     * The parser provided by `Visual Studio Code`
     */
    private vsCodeParser: MarkdownIt;

    /**
     * A `TextEditor` which is used for triggering the `extendMarkdownIt`-method.
     */
    private systemParserFixEditor: TextEditor;

    /**
     * A promise for waiting for the system-parser to be fixed.
     */
    private systemParserFixPromise: Promise<void>;

    /**
     * A method for resolving the system-parser fix.
     */
    private systemParserFixResolver: () => void;

    /**
     * Initializes a new instance of the `Extension` class.
     *
     * @param extensionRoot
     * The root of the extension.
     */
    public constructor(extensionRoot: string)
    {
        this.extensionRoot = Path.dirname(PkgUp.sync({ cwd: extensionRoot }));
        this.metaData = require(Path.join(this.extensionRoot, "package.json"));
        this.systemParserFixPromise = new Promise(
            (resolve) =>
            {
                this.systemParserFixResolver = resolve;
            });

        Resources.Culture = new CultureInfo(env.language);
    }

    /**
     * Gets context of the of the extension.
     */
    public get Context()
    {
        return this.context;
    }

    /**
     * Gets the path to the root of the extension.
     */
    public get ExtensionRoot()
    {
        return this.extensionRoot;
    }

    /**
     * Gets the meta-data of the extension.
     */
    public get MetaData()
    {
        return this.metaData;
    }

    /**
     * Gets the author of the extension.
     */
    public get Author()
    {
        return this.MetaData["publisher"];
    }

    /**
     * Gets the name of the extension.
     */
    public get Name()
    {
        return this.MetaData["name"];
    }

    /**
     * Gets the full name of the extension.
     */
    public get FullName()
    {
        return `${this.Author}.${this.Name}`;
    }

    /**
     * Gets the parser provided by Visual Studio Code.
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
    public async Active(context: ExtensionContext)
    {
        this.context = context;

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
        if (isNullOrUndefined(this.VSCodeParser))
        {
            let document = await workspace.openTextDocument(Uri.parse("untitled:.md"));

            this.systemParserFixEditor = await window.showTextDocument(
                document,
                {
                    viewColumn: ViewColumn.Beside,
                    preview: true
                });
        }

        return this.systemParserFixPromise;
    }

    /**
     * Executes a task.
     *
     * @param task
     * The task to execute.
     */
    protected async ExecuteTask(task: Task)
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
                message = Format(Resources.Resources.Get("UnknownException"), exception.name, exception.message);
            }
            else
            {
                message = Format(Resources.Resources.Get("UnknownError"), exception);
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
    protected async ExecuteTaskInternal(task: Task)
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
}