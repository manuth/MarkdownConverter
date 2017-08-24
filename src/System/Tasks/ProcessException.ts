import { Exception } from "../Exception";

/**
 * Represents an Input-/Output-Exception.
 */
export class ProcessException extends Exception
{
    /**
     * Gets or sets the standard-output of the process that caused the exception.
     */
    public StdOut : string;

    /**
     * Gets or sets the standard-error of the process that caused the exception.
     */
    public StdErr : string;

    /**
     * Gets or sets the error that caused the exception.
     */
    public Error : Error;

    /**
     * Initializes a new instance of the ProcessException class with a message and console-outputs.
     * 
     * @param message
     * The message of the exception.
     * 
     * @param stdout
     * The standard-output of the process that caused the exception.
     * 
     * @param stderr
     * The standard-error of the process that caused the exception.
     * 
     * @param error
     * The error that caused the exception.
     */
    constructor(message : string, stdout : string, stderr : string, error : Error)
    {
        super(message);
        this.StdOut = stdout;
        this.StdErr = stderr;
        this.Error = error;
    }
}