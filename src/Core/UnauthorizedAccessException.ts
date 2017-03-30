import { FileException } from './FileException';
import * as Format from 'string-format';

/**
 * Represents a 'File not found'-Exception.
 */
export class UnauthorizedAccessException extends FileException
{
    /**
     * Gets or sets the path to the file which caused the exception.
     */
    public Path : string;

    /**
     * Initializes a new instance of the UnauthorizedAccessException class with a message and a path.
     * 
     * @param path
     * The path to the file which caused the exception.
     */
    constructor(path : string);

    /**
     * Initializes a new instance of the UnauthorizedAccessException class with a message and a path.
     * 
     * @param message
     * The message of the exception.
     * 
     * @param path
     * The path to the file which caused the exception.
     */
    constructor(message : string, path : string);

    constructor(message : string, path? : string)
    {
        if (arguments.length == 1)
        {
            path = message;
            message = Format('Couldn\'t access the file {0}.', path);
        }
        super(message, path);
    }
}