import { ISettings } from "../Properties/ISettings";

/**
 * Represents a test-context.
 */
export interface ITestContext
{
    /**
     * Gets or sets the intercepted settings.
     */
    Settings: ISettings;
}
