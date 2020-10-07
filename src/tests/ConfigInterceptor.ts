import { workspace } from "vscode";
import { ISettings } from "../Properties/ISettings";
import { ConfigurationSection } from "./ConfigurationSection";
import { ITestContext } from "./ITestContext";

/**
 * Provides the functionality to intercept the vscode-configuration.
 */
export class ConfigInterceptor
{
    /**
     * The target of the interception.
     */
    private target: typeof workspace["getConfiguration"] = null;

    /**
     * The intercepted settings.
     */
    private context: ITestContext = {
        Settings: {}
    };

    /**
     * Registers hooks for the interceptor.
     */
    public Register(): void
    {
        suiteSetup(
            () =>
            {
                this.Setup();
            });

        suiteTeardown(
            () =>
            {
                this.Dispose();
            });
    }

    /**
     * Gets the target of the interception.
     */
    public get Target(): typeof workspace["getConfiguration"]
    {
        return this.target;
    }

    /**
     * Gets the test-context.
     */
    public get Context(): ITestContext
    {
        return this.context;
    }

    /**
     * Gets or sets the intercepted settings.
     */
    public get Settings(): ISettings
    {
        return this.Context.Settings;
    }

    /**
     * @inheritdoc
     */
    public set Settings(value: ISettings)
    {
        this.Context.Settings = value;
    }

    /**
     * Installs the interceptor.
     */
    protected Setup(): void
    {
        this.target = workspace.getConfiguration;
        workspace.getConfiguration = (section, scope) => new ConfigurationSection(this, section, scope).Proxy;
    }

    /**
     * Releases all resources.
     */
    protected Dispose(): void
    {
        workspace.getConfiguration = this.Target;
    }
}
