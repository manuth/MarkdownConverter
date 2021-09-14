import { CancellationToken, Progress } from "vscode";
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
     * Initializes a new instance of the {@link Task `Task`} class.
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
    public get Extension(): TExtension
    {
        return this.extension;
    }

    /**
     * Gets the title of the task.
     */
    public abstract get Title(): string;

    /**
     * Gets a value indicating whether this task can be canceled.
     */
    public get Cancellable(): boolean
    {
        return true;
    }

    /**
     * Executes the task.
     *
     * @param progressReporter
     * A component for reporting progress.
     *
     * @param cancellationToken
     * A component for handling cancellation-requests.
     */
    public abstract Execute(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken): Promise<void>;
}
