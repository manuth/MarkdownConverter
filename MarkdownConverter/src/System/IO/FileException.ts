import Format = require("string-template");
import { Resources } from "../../Properties/Resources";
import { Exception } from "../Exception";
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
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a null reference if no inner exception is specified.
     */
    constructor(message?: string, path?: string, innerException?: Exception)
    {
        super(message, innerException);
        this.Path = path;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        return this.Message || Format(Resources.Resources.Get("FileException"), this.Path);
    }
}