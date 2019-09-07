import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";

/**
 * Provides the functionality to store and restore VSCode-configuration.
 */
export class ConfigRestorer
{
    /**
     * The original settings.
     */
    private originalSettings: Array<ReturnType<WorkspaceConfiguration["inspect"]>> = [];

    /**
     * The section of the setting-keys.
     */
    private section: string = undefined;

    /**
     * The keys of the settings to store and restore.
     */
    private settingKeys: string[];

    /**
     * Initializes a new instance of the `ConfigRestorer` class.
     *
     * @param keys
     * The keys to store.
     *
     * @param section
     * The section of the setting-keys.
     */
    public constructor(keys: string[], section?: string)
    {
        let config = workspace.getConfiguration(section);
        this.settingKeys = keys;
        this.section = section;

        for (let key of this.settingKeys)
        {
            this.originalSettings.push(config.inspect(key));
        }
    }

    /**
     * Gets the section of the setting-keys.
     */
    public get Section()
    {
        return this.section;
    }

    /**
     * Gets the keys to store.
     */
    public get SettingKeys(): readonly string[]
    {
        return this.settingKeys;
    }

    /**
     * Gets the original settings.
     */
    public get OriginalSettings(): ReadonlyArray<Readonly<ReturnType<WorkspaceConfiguration["inspect"]>>>
    {
        return this.originalSettings;
    }

    /**
     * Removes the specified configuration from VSCode and saves them for restoration.
     */
    public async Clear()
    {
        return this.Toggle();
    }

    /**
     * Restores the saved configuration.
     */
    public async Restore()
    {
        return this.Toggle(true);
    }

    /**
     * Toggles a save or restore of the config.
     *
     * @param restore
     * A value indicating whether a restoration should be performed.
     */
    protected async Toggle(restore?: boolean)
    {
        let rootConfig = workspace.getConfiguration();
        let config = workspace.getConfiguration(this.Section);

        let scopeMap: Array<[keyof ReturnType<WorkspaceConfiguration["inspect"]>, ConfigurationTarget]> = [
            ["globalValue", ConfigurationTarget.Global],
            ["workspaceValue", ConfigurationTarget.Workspace],
            ["workspaceFolderValue", ConfigurationTarget.WorkspaceFolder]
        ];

        for (let setting of this.OriginalSettings)
        {
            let newSetting = rootConfig.inspect(setting.key);

            for (let scope of scopeMap)
            {
                if (setting[scope[0]] !== (restore ? newSetting[scope[0]] : undefined))
                {
                    await rootConfig.update(setting.key, restore ? setting[scope[0]] : undefined, scope[1]);
                }
            }
        }
    }
}