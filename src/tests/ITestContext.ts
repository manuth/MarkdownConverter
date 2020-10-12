/**
 * Represents a test-context.
 */
export interface ITestContext<TSection extends any = any>
{
    /**
     * Gets or sets the intercepted settings.
     */
    Settings: Partial<TSection>;

    /**
     * Forces all settings to resolve to the default value.
     */
    Clear(): void;
}
