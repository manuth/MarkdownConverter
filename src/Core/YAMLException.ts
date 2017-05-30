import { Exception } from "./Exception";

/**
 * Represents a YAML-exception.
 */
export class YAMLException extends Exception
{
    /**
     * The name of the exception.
     */
    name : string;

    /**
     * The reason of the exception.
     */
    reason : string;

    /**
     * The mark of the exception.
     */
    mark : { name : string, buffer : string, position : number, line : number, column : number };

    /**
     * The message of the exception.
     */
    message : string;

    /**
     * Initializes a new instance of the YAMLException class.
     * @param exception
     * The exception to copy the values from.
     */
    public constructor(exception : any);

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
    public constructor(name : string, reason : string, mark : any, message : string);
    public constructor(name : string | any, reason? : string, mark? : any, message? : string)
    {
        super();
        if (arguments.length == 1)
        {
            let exception : { name : string, reason : string, mark : any, message : string } = name;
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
}