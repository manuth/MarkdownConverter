/**
 * Represents an Exception
 */
export class Exception extends Error
{
    /**
     * A collection of key/value pairs that provide additional user-defined information about the exception.
     */
    private data: any[];

    /**
     * The message of the exception.
     */
    private exceptionMessage: string;

    /**
     * The Exception instance that caused the current exception.
     */
    private innerException: Exception = null;

    /**
     * Initializes a new instance of the `Exception`.
     *
     * @param message
     * The error message that explains the reason for the exception.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a `null` reference if no inner exception is specified.
     */
    public constructor(message?: string, innerException?: Exception)
    {
        super();
        this.exceptionMessage = message;

        if (innerException)
        {
            this.innerException = innerException;
        }
    }

    /**
     * Gets a collection of key/value pairs that provide additional user-defined information about the exception.
     */
    public get Data(): any[]
    {
        return this.data;
    }

    /**
     * Gets the Exception instance that caused the current exception.
     */
    public get InnerException(): Exception
    {
        return this.innerException;
    }

    /**
     * Gets a message that describes the current exception.
     */
    public get Message(): string
    {
        return this.exceptionMessage;
    }

    /**
     * @inheritdoc
     */
    public get message(): string
    {
        return this.Message;
    }

    /**
     * Gets a string representation of the immediate frames on the call stack.
     */
    public get StackTrace(): string
    {
        return this.stack;
    }

    /**
     * Gets a string representing this exception.
     *
     * @returns
     * A string representing this object.
     */
    public toString(): string
    {
        return this.Message;
    }
}
