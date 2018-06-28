import * as Path from "path";
import { ResourceManager } from "localizable-resources";
import CultureInfo from "culture-info";

/**
 * Provides the functionality to handle the resources of the extension.
 */
export default class Resources
{
    /**
     * The resources of the extension.
     */
    private static resources: ResourceManager = new ResourceManager(Path.join(__dirname, "..", "..", "Resources", "MarkdownConverter"));

    /**
     * Gets or sets the culture of the resources.
     */
    public static get Culture(): CultureInfo
    {
        return this.resources.Culture;
    }

    public static set Culture(value: CultureInfo)
    {
        this.resources.Culture = value;
    }

    /**
     * Gets the resource-object with the specified id.
     *
     * @param id
     * The id of the resource to return.
     *
     * @param culture
     * The culture which resource-object to get.
     */
    public static Get<T>(id: string, culture?: CultureInfo)
    {
        return (this.resources.GetObject(id, culture) as any) as T;
    }
}