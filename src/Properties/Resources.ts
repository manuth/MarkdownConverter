/* eslint-disable @typescript-eslint/no-var-requires */
import { CultureInfo, IResourceManager, MustacheResourceManager, Resource, ResourceManager } from "@manuth/resource-manager";
import Files = require("./Files");

/**
 * Represents the resources of the module.
 */
export class Resources
{
    /**
     * The resources.
     */
    private static resources: IResourceManager = new MustacheResourceManager(
        new ResourceManager(
            [
                new Resource(require("../../Resources/MarkdownConverter.json")),
                new Resource(require("../../Resources/MarkdownConverter.de.json"), new CultureInfo("de"))
            ]));

    /**
     * The files.
     */
    private static files = new ResourceManager(
        [
            new Resource(Files as any)
        ]);

    /**
     * Sets the culture of the resources.
     */
    public static set Culture(value: CultureInfo)
    {
        this.resources.Locale =
            this.files.Locale = value;
    }

    /**
     * Gets the resources.
     */
    public static get Resources(): IResourceManager
    {
        return this.resources;
    }

    /**
     * Gets the files.
     */
    public static get Files(): IResourceManager
    {
        return this.files;
    }
}
