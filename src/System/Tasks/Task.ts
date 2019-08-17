import { Progress } from "vscode";
import { Extension } from "../Extensibility/Extension";
import { IProgressState } from "./IProgressState";

/**
 * Represents a task.
 *
 * @template TExtension
 * The type of the extension.
 */
export abstract class Task<TExtension extends Extension = Extension>
{
    /**
     * The extension this task belongs to.
     */
    private extension: TExtension;

    /**
     * Initializes a new instance of the `Task` class.
     *
     * @param extension
     * The extension this task belongs to.
     */
    public constructor(extension: TExtension)
    {
        this.extension = extension;
    }

    /**
     * Gets or sets the extension this task belongs to.
     */
    public get Extension()
    {
        return this.extension;
    }

    /**
     * Gets the title of the task.
     */
    public abstract get Title(): string;

    /**
     * Executes the task.
     */
    public abstract async Execute(progressReporter?: Progress<IProgressState>): Promise<void>;
}