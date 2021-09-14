import { types } from "util";
import { ConfigurationScope, ConfigurationTarget, WorkspaceConfiguration } from "vscode";
import { ISettings } from "../Properties/ISettings";
import { ConfigInterceptor } from "./ConfigInterceptor";

/**
 * Represents a configuration-section.
 */
export class ConfigurationSection implements WorkspaceConfiguration
{
    /**
     * The scope of this section.
     */
    private scope: ConfigurationScope;

    /**
     * The interceptor of this section.
     */
    private interceptor: ConfigInterceptor;

    /**
     * The target of the section.
     */
    private target: WorkspaceConfiguration;

    /**
     * Initializes a new instance of the `ConfigurationSection` class.
     *
     * @param interceptor
     * The interceptor of this section.
     *
     * @param section
     * The fully qualified key of the section.
     *
     * @param scope
     * The scope to get the configuration for.
     */
    public constructor(interceptor: ConfigInterceptor, section?: string, scope?: ConfigurationScope)
    {
        this.interceptor = interceptor;
        this.scope = scope;
        this.target = this.interceptor.Target(section, scope);
    }

    /**
     * Gets the interceptor of this section.
     */
    public get Interceptor(): ConfigInterceptor
    {
        return this.interceptor;
    }

    /**
     * Gets the target of the section.
     */
    public get Target(): WorkspaceConfiguration
    {
        return this.target;
    }

    /**
     * Gets a proxy for the configuration-section.
     */
    public get Proxy(): WorkspaceConfiguration
    {
        let interceptor: WorkspaceConfiguration = {
            get: (section: any, defaultValue?: any) => this.get(section, defaultValue),
            has: (section) => this.has(section),
            inspect: (section) => this.inspect(section),
            update: (section, value, target, overrideLanguage) => this.update(section, value, target, overrideLanguage)
        };

        return new Proxy(
            {} as WorkspaceConfiguration,
            {
                get: (target, key) =>
                {
                    if (key in interceptor)
                    {
                        return interceptor[key as keyof WorkspaceConfiguration];
                    }
                    else
                    {
                        return this.get(key as string);
                    }
                },
                has: (target, key) =>
                {
                    return (key in interceptor) || this.has(key as string);
                }
            });
    }

    /**
     * Gets the value at the specified {@link section `section`}.
     *
     * @template T
     * The type of the section to get.
     *
     * @param section
     * The section of the value to get.
     *
     * @returns
     * The value of the specified {@link section `section`}.
     */
    public get<T>(section: string): T;

    /**
     * Gets the value at the specified {@link section `section`}.
     *
     * @template T
     * The type of the section to get.
     *
     * @param section
     * The section of the value to get.
     *
     * @param defaultValue
     * The default value to apply.
     *
     * @returns
     * The value of the specified {@link section `section`}.
     */
    public get<T>(section: string, defaultValue: T): T;

    /**
     * Gets the value at the specified {@link section `section`}.
     *
     * @param section
     * The section of the value to get.
     *
     * @param defaultValue
     * The default value to apply.
     *
     * @returns
     * The value of the specified {@link section `section`}.
     */
    public get(section: string, defaultValue?: any): any
    {
        try
        {
            return this.GetInterception(section) ?? defaultValue ?? this.Target.inspect(section).defaultValue;
        }
        catch
        {
            let value = this.Target.get(section, defaultValue);

            if (types.isProxy(value))
            {
                let configurationSection = new ConfigurationSection(this.Interceptor, this.GetKey(section), this.scope);

                return new Proxy<any>(
                    {},
                    {
                        get(target, key)
                        {
                            return configurationSection.get(key as string);
                        },
                        has(target, key)
                        {
                            return configurationSection.has(key as string);
                        }
                    });
            }
            else
            {
                return value;
            }
        }
    }

    /**
     * Checks whether the specified {@link section `section`} exists.
     *
     * @param section
     * The section to check.
     *
     * @returns
     * A value indicating whether the specified section exists.
     */
    public has(section: string): boolean
    {
        return this.HasInterception(section) ? (this.GetInterception(section) !== undefined) : this.Target.has(section);
    }

    /**
     * @inheritdoc
     *
     * @template T
     * The type of the section to get.
     *
     * @param section
     * The section to inspect.
     *
     * @returns
     * The result of the inspection.
     */
    // eslint-disable-next-line jsdoc/require-jsdoc
    public inspect<T>(section: string): { key: string, defaultValue?: T, globalValue?: T, workspaceValue?: T, workspaceFolderValue?: T, defaultLanguageValue?: T, globalLanguageValue?: T, workspaceLanguageValue?: T, workspaceFolderLanguageValue?: T, languageIds?: string[] }
    {
        let result = this.Target.inspect(section);

        if (this.HasInterception(section))
        {
            let value = this.GetInterception(section);

            result = {
                ...result,
                globalLanguageValue: value,
                globalValue: value,
                workspaceFolderLanguageValue: value,
                workspaceFolderValue: value,
                workspaceLanguageValue: value,
                workspaceValue: value
            };
        }

        return result as any;
    }

    /**
     * Updates the configuration at the specified {@link section `section`}.
     *
     * @param section
     * The section to update.
     *
     * @param value
     * The value to set.
     *
     * @param configurationTarget
     * The target to save the configuration to.
     *
     * @param overrideInLanguage
     * A value indicating whether the configuration should be stored in a language-override.
     */
    public async update(section: string, value: any, configurationTarget?: boolean | ConfigurationTarget, overrideInLanguage?: boolean): Promise<void>
    {
        return this.Target.update(section, value, configurationTarget, overrideInLanguage);
    }

    /**
     * Gets the interception for the specified {@link section `section`}.
     *
     * @param section
     * The section to get the interception for.
     *
     * @returns
     * The intercepted value for the specified {@link section `section`}.
     */
    public GetInterception(section: string): any
    {
        let key = this.GetInterceptionKey(section);

        if (this.Interceptor.SettingManager.Exists(key))
        {
            return this.Interceptor.SettingManager.Get(key);
        }
        else
        {
            throw new Error();
        }
    }

    /**
     * Sets an intercepted config-value.
     *
     * @param section
     * The section to intercept.
     *
     * @param value
     * The value to intercept.
     */
    public SetInterception(section: string, value: any): void
    {
        let key = this.GetInterceptionKey(section);
        this.Interceptor.Settings[key as keyof ISettings] = value;
    }

    /**
     * Determines whether an interception for the specified {@link section `section`} exists.
     *
     * @param section
     * The section to check.
     *
     * @returns
     * A value indicating whether an interception for the specified {@link section `section`} exists.
     */
    public HasInterception(section: string): boolean
    {
        try
        {
            this.GetInterception(section);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /**
     * Gets the key of the specified {@link section `section`} relative to the intercepted section.
     *
     * @param section
     * The section of the key to get.
     *
     * @returns
     * The key relative to the intercepted section.
     */
    protected GetInterceptionKey(section: string): string
    {
        if (!this.Interceptor.Section)
        {
            return section;
        }
        else
        {
            let key = this.GetKey(section);
            let path = key.split(".");

            if (path[0] === this.Interceptor.Section)
            {
                return path.slice(1).join(".");
            }
            else
            {
                throw new Error();
            }
        }
    }

    /**
     * Determines the key of the specified {@link section `section`}.
     *
     * @param section
     * The section of the key to get.
     *
     * @returns
     * The key of the specified {@link section `section`}.
     */
    protected GetKey(section: string): string
    {
        return this.Target.inspect(section).key;
    }
}
