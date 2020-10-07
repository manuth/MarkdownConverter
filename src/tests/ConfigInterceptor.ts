import { ObjectResource, Resource } from "@manuth/resource-manager";
import { workspace } from "vscode";
import { ConfigurationSection } from "./ConfigurationSection";
import { ITestContext } from "./ITestContext";
import { TestContext } from "./TestContext";

/**
 * Provides the functionality to intercept the vscode-configuration.
 */
export class ConfigInterceptor<TSection extends any = any>
{
    /**
     * The target of the interception.
     */
    private target: typeof workspace["getConfiguration"] = null;

    /**
     * The name of the intercepted section.
     */
    private section: string = null;

    /**
     * The intercepted settings.
     */
    private settings: Partial<TSection> = {};

    /**
     * Initializes a new instance of the `ConfigInterceptor` class.
     *
     * @param section
     * The name of the intercepted section.
     */
    public constructor(section?: string)
    {
        this.section = section ?? null;
    }

    /**
     * Gets the target of the interception.
     */
    public get Target(): typeof workspace["getConfiguration"]
    {
        return this.target;
    }

    /**
     * Gets the name of the intercepted section.
     */
    public get Section(): string
    {
        return this.section;
    }

    /**
     * Gets the test-context.
     */
    public get Context(): ITestContext<Partial<TSection>>
    {
        return new TestContext(this);
    }

    /**
     * Gets or sets the intercepted settings.
     */
    public get Settings(): Partial<TSection>
    {
        return this.settings;
    }

    /**
     * @inheritdoc
     */
    public set Settings(value: Partial<TSection>)
    {
        this.settings = value;
    }

    /**
     * Gets an object for managing settings.
     */
    public get SettingManager(): Resource
    {
        return new ObjectResource(this.Settings);
    }

    /**
     * Registers hooks for the interceptor.
     */
    public Register(): void
    {
        suiteSetup(
            () =>
            {
                this.Initialize();
            });

        suiteTeardown(
            () =>
            {
                this.Dispose();
            });

        setup(
            () =>
            {
                this.Settings = {};
            });
    }

    /**
     * Forces all configurations of the intercepted section to resolve to the default value.
     */
    public Clear(): void
    {
        this.ClearSection(this.Section);
    }

    /**
     * Installs the interceptor.
     */
    public Initialize(): void
    {
        this.target = workspace.getConfiguration;
        workspace.getConfiguration = (section, scope) => new ConfigurationSection(this, section, scope).Proxy;
    }

    /**
     * Releases all resources.
     */
    public Dispose(): void
    {
        workspace.getConfiguration = this.Target;
    }

    /**
     * Clears the specified `section`.
     *
     * @param section
     * The fully qualified name of the section to clear.
     */
    protected ClearSection(section: string): void
    {
        let configSection: any;

        if (section)
        {
            configSection = this.Target().get<any>(section);
        }
        else
        {
            configSection = this.Target();
        }

        for (let key in configSection)
        {
            let value = configSection[key];

            if (typeof value !== "function")
            {
                let absoluteKey = this.Target(section).inspect(key).key;

                if (
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value))
                {
                    this.ClearSection(absoluteKey);
                }
                else
                {
                    new ConfigurationSection(this).SetInterception(absoluteKey, undefined);
                }
            }
        }
    }
}
