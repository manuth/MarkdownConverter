import format = require("string-template");
import { Resources } from "../../Properties/Resources";
import { Exception } from "../Exception";
import { IMark } from "./IMark";

/**
 * Represents a YAML-exception.
 */
export class YAMLException extends Exception
{
    /**
     * The reason of the exception.
     */
    private reason: string;

    /**
     * The mark of the exception.
     */
    private mark: IMark;

    /**
     * Initializes a new instance of the YAMLException class.
     *
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
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a `null` reference if no inner exception is specified.
     */
    public constructor(name: string, reason: string, mark: any, message: string, innerException?: Exception);

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
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a `null` reference if no inner exception is specified.
     */
    public constructor(name: string | any, reason?: string, mark?: IMark, message?: string, innerException?: Exception)
    {
        super(...(arguments.length === 1 ? [null, name] : [message, innerException]));

        if (arguments.length === 1)
        {
            let exception = name;
            this.name = exception.name;
            this.reason = exception.reason;
            this.mark = exception.mark;
        }
        else
        {
            this.name = name;
            this.reason = reason;
            this.mark = mark;
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
     * @inheritdoc
     */
    public get Message(): string
    {
        return super.Message || format(Resources.Resources.Get("YAMLException"), this.Mark.line + 1, this.Mark.column + 1);
    }

    /**
     * Gets the mark of the exception.
     */
    public get Mark(): IMark
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
