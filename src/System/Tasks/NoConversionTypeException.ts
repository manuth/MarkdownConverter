import { Resources } from "../../Properties/Resources";
import { Exception } from "../Exception";

/**
 * Represents an exception which occurs when no conversion-type was selected.
 */
export class NoConversionTypeException extends Exception
{
    /**
     * Initializes a new instance of the {@link NoConversionTypeException `NoConversionTypeException`} class.
     *
     * @param message
     * Either the error message that explains the reason for the exception or `null` to use the default message.
     */
    public constructor(message?: string)
    {
        super(message);
    }

    /**
     * @inheritdoc
     */
    public override get Message(): string
    {
        return super.Message ?? Resources.Resources.Get("NoConversionType");
    }
}
