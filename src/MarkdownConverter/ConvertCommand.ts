import { Extension } from "../extension";
import { Command } from "./Command";

/**
 * Provides a command for converting a markdown-document.
 */
export class ConvertCommand extends Command
{
    /**
     * Initializes a new instance of the `ConvertCommand` class.
     * 
     * @param extension
     * The extension the command belongs to.
     */
    public constructor(extension: Extension)
    {
        super(extension);
    }

    public Execute()
    {
        throw new Error("Method not implemented.");
    }
}