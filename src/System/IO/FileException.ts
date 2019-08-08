import Format = require("string-template");
import { Resources } from "../../Properties/Resources";
import { IOException } from "./IOException";

/**
 * Represents an Input-/Output-Exception.
 */
export class FileException extends IOException
{
    /**
     * Gets or sets the path to the file which caused the exception.
     */
    public Path: string;

    /**
     * Initializes a new instance of the FileException class with a message and a path.
     *
     * @param message
     * The message of the exception.
     *
     * @param path
     * The path to the file which caused the exception.
     */
    constructor(message: string, path: string)
    {
        super(message);
        this.Path = path;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        return Format(Resources.Resources.Get("FileException"), this.Path);
    }
}