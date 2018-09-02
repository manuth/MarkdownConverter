import { Extension } from "../extension";

/**
 * Represents a command.
 */
export abstract class Command
{
    /**
     * The extension this command belongs to.
     */
    private extension: Extension;

    /**
     * Initializes a new instance of the `Command` class.
     * 
     * @param extension
     * The extension this command belongs to.
     */
    public constructor(extension: Extension)
    {
        this.extension = extension;
    }

    /**
     * Gets or sets the extension this command belongs to.
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
     * Executes the command.
     */
    public abstract async Execute();
}