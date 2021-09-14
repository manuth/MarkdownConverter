import format = require("string-template");
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
     * Initializes a new instance of the FileException.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param path
     * The path to the file which caused the exception.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or `null` if no inner exception is specified.
     */
    public constructor(message?: string, path?: string, innerException?: Exception)
    {
        super(message, innerException);
        this.Path = path;
    }

    /**
     * @inheritdoc
     */
    public override get Message(): string
    {
        return super.Message || format(Resources.Resources.Get("FileException"), this.Path);
    }
}
