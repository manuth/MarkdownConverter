import { ObjectResource } from "localized-resource-manager";
import { Settings } from "../../../Properties/Settings";

/**
 * Provides an implementation of the `Settings` class for testing.
 */
export class TestSettings extends Settings
{
    /**
     * The resource to load the settings from.
     */
    private resource: ObjectResource = new ObjectResource(undefined);

    /**
     * Initializes a new instance of the `TestSettings` class.
     */
    public constructor()
    {
        super();
    }

    /**
     * Gets or sets the resource to load the settings from.
     */
    public get Resource(): ObjectResource
    {
        return this.resource;
    }

    /**
     * @inheritdoc
     */
    public set Resource(value: ObjectResource)
    {
        this.resource = value;
    }

    /**
     * @inheritdoc
     *
     * @param key
     * The key of the entry.
     *
     * @param defaultValue
     * The default value to return.
     *
     * @returns
     * The value of the configuration.
     */
    protected GetConfigEntry<T>(key: string, defaultValue?: T): T
    {
        if (this.resource.Exists(key))
        {
            return this.resource.Get(key);
        }
        else
        {
            return super.GetConfigEntry(key, defaultValue);
        }
    }
}
