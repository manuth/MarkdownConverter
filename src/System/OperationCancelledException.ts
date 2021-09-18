import { Resources } from "../Properties/Resources";
import { Exception } from "./Exception";

/**
 * Represents an exception that occurs on an operation-cancellation.
 */
export class OperationCancelledException extends Exception
{
    /**
     * Initializes a new instance of the {@link OperationCancelledException `OperationCancelledException`} class.
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
        return super.Message ?? Resources.Resources.Get("OperationCancelledException");
    }
}
