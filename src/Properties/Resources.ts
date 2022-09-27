import { CultureInfo, IResourceManager, MustacheResourceManager, Resource, ResourceManager } from "@manuth/resource-manager";
import { Files } from "./Files.js";
import { MarkdownConverterGerman } from "./Resources/MarkdownConverter.de.js";
import { MarkdownConverterInvariant } from "./Resources/MarkdownConverter.inv.js";

/**
 * Represents the resources of the module.
 */
export class Resources
{
    /**
     * The resources.
     */
    private static resources: IResourceManager = null;

    /**
     * The files.
     */
    private static files: IResourceManager = null;

    /**
     * Sets the culture of the resources.
     */
    public static set Culture(value: CultureInfo)
    {
        this.Resources.Locale =
            this.Files.Locale = value;
    }

    /**
     * Gets the resources.
     */
    public static get Resources(): IResourceManager
    {
        if (this.resources === null)
        {
            this.resources = new MustacheResourceManager(
                new ResourceManager(
                    [
                        new Resource(MarkdownConverterInvariant),
                        new Resource(MarkdownConverterGerman, new CultureInfo("de"))
                    ]));
        }

        return this.resources;
    }

    /**
     * Gets the files.
     */
    public static get Files(): IResourceManager
    {
        if (this.files === null)
        {
            this.files = new ResourceManager(
                [
                    new Resource(Files as any)
                ]);
        }

        return this.files;
    }
}
