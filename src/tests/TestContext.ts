import { ConfigInterceptor } from "./ConfigInterceptor";
import { ITestContext } from "./ITestContext";

/**
 * Represents a test-context.
 */
export class TestContext<TSection extends any = any> implements ITestContext<TSection>
{
    /**
     * The config-interceptor of this context.
     */
    private interceptor: ConfigInterceptor<TSection>;

    /**
     * Initializes a new instance of the `TextContext`.
     *
     * @param interceptor
     * The config-interceptor of this context.
     */
    public constructor(interceptor: ConfigInterceptor<TSection>)
    {
        this.interceptor = interceptor;
    }

    /**
     * @inheritdoc
     */
    public get Settings(): Partial<TSection>
    {
        return this.interceptor.Settings;
    }

    /**
     * @inheritdoc
     */
    public set Settings(value: Partial<TSection>)
    {
        this.interceptor.Settings = value;
    }

    /**
     * @inheritdoc
     */
    public Clear(): void
    {
        this.interceptor.Clear();
    }
}
