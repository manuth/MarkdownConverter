import Format = require("string-template");
import { Exception } from "../Exception";
import { FileException } from "./FileException";

/**
 * Represents a 'File not found'-Exception.
 */
export class FileNotFoundException extends FileException
{
    /**
     * Initializes a new instance of the FileNotFoundException class with a message and a path.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param path
     * The path to the file which caused the exception.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a `null` reference if no inner exception is specified.
     */
    public constructor(message: string, path: string, innerException?: Exception)
    {
        if (arguments.length === 1)
        {
            path = message;
            message = Format("The file {0} couldn't be found.", path);
        }

        super(message, path, innerException);
    }
}
