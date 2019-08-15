import { Extension } from "../System/Extensibility/Extension";

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
     * Executes the task.
     */
    public abstract async Execute(): Promise<void>;
}