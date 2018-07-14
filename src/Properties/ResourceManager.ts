import CultureInfo from "culture-info";
import * as Path from "path";
import Resource from "../System/Resources/Resource";

/**
 * Represents the resources of the module.
 */
export default class ResourceManager
{
    /**
     * The resources.
     */
    private static resources = new Resource(Path.join(__dirname, "..", "..", "Resources", "MarkdownConverter"));

    /**
     * The files.
     */
    private static files = new Resource(Path.join(__dirname, "..", "..", "Resources", "Files"));

    /**
     * Sets the culture of the resources.
     */
    public static set Culture(value: CultureInfo)
    {
        this.resources.Culture =
            this.files.Culture = value;
    }

    /**
     * Gets the resources.
     */
    public static get Resources(): Resource
    {
        return this.resources;
    }

    /**
     * Gets the files.
     */
    public static get Files(): Resource
    {
        return this.files;
    }
}