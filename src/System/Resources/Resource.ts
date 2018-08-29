import CultureInfo from "culture-info";
import { ResourceManager } from "localizable-resources";

/**
 * Provides the functionality for handling resources.
 */
export class Resource
{
    /**
     * The resources handled by this `Resource`.
     */
    private resources: ResourceManager;

    /**
     * Initializes a new instance of the `Resource` class.
     *
     * @param baseFileName
     * The base name of the resource-files.
     *
     * @param culture
     * The culture which resources to get by default.
     */
    public constructor(baseFileName: string, locale?: CultureInfo)
    {
        this.resources = new ResourceManager(baseFileName, locale);
    }

    /**
     * Gets or sets the culture of the resources.
     */
    public get Culture(): CultureInfo
    {
        return this.resources.Culture;
    }

    public set Culture(value: CultureInfo)
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
    public Get<T>(id: string, culture?: CultureInfo)
    {
        return (this.resources.GetObject(id, culture) as any) as T;
    }
}