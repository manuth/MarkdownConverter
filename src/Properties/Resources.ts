import { CultureInfo, ResourceManager } from "localized-resource-manager";
import Path = require("path");

/**
 * Represents the resources of the module.
 */
export class Resources
{
    /**
     * The resources.
     */
    private static resources = new ResourceManager(Path.join(__dirname, "..", "..", "Resources", "MarkdownConverter"));

    /**
     * The files.
     */
    private static files = new ResourceManager(Path.join(__dirname, "..", "..", "Resources", "Files"));

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
    public static get Resources(): ResourceManager
    {
        return this.resources;
    }

    /**
     * Gets the files.
     */
    public static get Files(): ResourceManager
    {
        return this.files;
    }
}