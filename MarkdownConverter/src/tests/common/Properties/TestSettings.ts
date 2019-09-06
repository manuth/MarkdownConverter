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
    public get Resource()
    {
        return this.resource;
    }

    public set Resource(value)
    {
        this.resource = value;
    }

    /**
     * @inheritdoc
     */
    protected GetConfigEntry<T>(key: string, defaultValue?: T): T
    {
        if (this.resource.Exists(key))
        {
            return this.resource.Get(key);
        }
        else
        {
            return super.GetConfigEntry(...(arguments as any as [string, T]));
        }
    }
}