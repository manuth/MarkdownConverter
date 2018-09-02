import * as Format from "string-template";
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
     * The message of the exception.
     * 
     * @param path
     * The path to the file which caused the exception.
     */
    constructor(message: string, path: string)
    {
        if (arguments.length === 1)
        {
            path = message;
            message = Format("The file {0} couldn't be found.", path);
        }
        super(message, path);
    }
}