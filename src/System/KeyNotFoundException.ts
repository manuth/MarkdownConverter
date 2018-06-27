import Exception from "./Exception";

/**
 * The exception that is thrown when the key specified for accessing an element in a collection does not match any key in the collection.
 */
export default class KeyNotFoundException extends Exception
{
    /**
     * Initializes a new instance of the `KeyNotFoundException` class.
     * 
     * @param message
     * The message of the exception.
     * 
     * @param innerException
     * The exception that is the cause of the current exception. If the innerException parameter is not null, the current exception is raised in a catch block that handles the inner exception.
     */
    public constructor(message?: string, innerException?: Exception)
    {
        super(message, innerException);
    }
}