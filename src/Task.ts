import { Extension } from "./extension";

/**
 * Represents a task.
 */
export abstract class Task
{
    /**
     * The extension this task belongs to.
     */
    private extension: Extension;

    /**
     * Initializes a new instance of the `Task` class.
     *
     * @param extension
     * The extension this task belongs to.
     */
    public constructor(extension: Extension)
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

    public set Extension(value)
    {
        this.extension = value;
    }

    /**
     * Executes the task.
     */
    public abstract async Execute(): Promise<void>;
}