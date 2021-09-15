import format = require("string-template");
import { Resources } from "../../Properties/Resources";
import { Exception } from "../Exception";
import { FileException } from "./FileException";

/**
 * Represents a "File not found"-Exception.
 */
export class FileNotFoundException extends FileException
{
    /**
     * Initializes a new instance of the {@link FileNotFoundException `FileNotFoundException`} class.
     *
     * @param path
     * The path to the file which caused the exception.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or `null` if no inner exception is specified.
     */
    public constructor(path: string, message?: string, innerException?: Exception)
    {
        if (arguments.length === 1)
        {
            message = format(Resources.Resources.Get("FileNotFoundException"), path);
        }

        super(message, path, innerException);
    }
}
