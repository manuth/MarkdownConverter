/**
 * Represents a test-context.
 *
 * @template TSection
 * The type of the intercepted settings-section.
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
