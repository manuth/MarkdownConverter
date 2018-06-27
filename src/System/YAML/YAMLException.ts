import Exception from "../Exception";

/**
 * Represents a YAML-exception.
 */
export default class YAMLException extends Exception
{
    /**
     * The reason of the exception.
     */
    private reason: string;

    /**
     * The mark of the exception.
     */
    private mark: { name: string, buffer: string, position: number, line: number, column: number };

    /**
     * Initializes a new instance of the YAMLException class.
     * @param exception
     * The exception to copy the values from.
     */
    public constructor(exception: any);

    /**
     * Initializes a new instance of the YAMLException class with a name, a reason, a mark and a message.
     * 
     * @param name
     * The name of the exception.
     * 
     * @param reason
     * The reason for the exception.
     * 
     * @param mark
     * The mark of the position that caused the exception.
     * 
     * @param message
     * The message of the exception.
     */
    public constructor(name: string, reason: string, mark: any, message: string);
    public constructor(name: string | any, reason?: string, mark?: any, message?: string)
    {
        super();
        if (arguments.length === 1)
        {
            let exception: { name: string, reason: string, mark: any, message: string } = name;
            this.name = exception.name;
            this.reason = exception.reason;
            this.mark = exception.mark;
            this.message = exception.message;
        }
        else
        {
            this.name = name;
            this.reason = reason;
            this.mark = mark;
            this.message = message;
        }
    }

    /**
     * Gets the name of the exception.
     */
    public get Name(): string
    {
        return this.name;
    }

    /**
     * Gets the mark of the exception.
     */
    public get Mark(): { name: string, buffer: string, position: number, line: number, column: number }
    {
        return this.mark;
    }

    /**
     * Gets the reason of the exception.
     */
    public get Reason(): string
    {
        return this.reason;
    }
}