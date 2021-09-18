import format = require("string-template");
import { Resources } from "../../Properties/Resources";
import { Exception } from "../Exception";
import { IMarker } from "./IMarker";

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
     * The marker of the exception.
     */
    private marker: IMarker;

    /**
     * Initializes a new instance of the {@link YAMLException `YAMLException`} class.
     *
     * @param exception
     * The exception to copy the values from.
     */
    public constructor(exception: any);

    /**
     * Initializes a new instance of the {@link YAMLException `YAMLException`} class with a name, a reason, a mark and a message.
     *
     * @param name
     * The name of the exception.
     *
     * @param reason
     * The reason for the exception.
     *
     * @param marker
     * The marker of the position that caused the exception.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or `null` if no inner exception is specified.
     */
    public constructor(name: string, reason: string, marker: any, message: string, innerException?: Exception);

    /**
     * Initializes a new instance of the {@link YAMLException `YAMLException`} class with a name, a reason, a mark and a message.
     *
     * @param name
     * The name of the exception.
     *
     * @param reason
     * The reason for the exception.
     *
     * @param marker
     * The marker of the position that caused the exception.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     *
     * @param innerException
     * The exception that is the cause of the current exception, or a `null` reference if no inner exception is specified.
     */
    public constructor(name: string | any, reason?: string, marker?: IMarker, message?: string, innerException?: Exception)
    {
        super(...(arguments.length === 1 ? [null, name] : [message, innerException]));

        if (arguments.length === 1)
        {
            let exception = name;
            this.name = exception.name;
            this.reason = exception.reason;
            this.marker = exception.mark;
        }
        else
        {
            this.name = name;
            this.reason = reason;
            this.marker = marker;
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
    public override get Message(): string
    {
        return super.Message ?? format(Resources.Resources.Get("YAMLException"), this.Marker.line + 1, this.Marker.column + 1);
    }

    /**
     * Gets the mark of the exception.
     */
    public get Marker(): IMarker
    {
        return this.marker;
    }

    /**
     * Gets the reason of the exception.
     */
    public get Reason(): string
    {
        return this.reason;
    }
}
