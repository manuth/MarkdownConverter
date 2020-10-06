import { join } from "upath";
import { Constants } from "../Constants";

/**
 * Joins a path relative to the resource.
 *
 * @param path
 * The path to join.
 *
 * @returns
 * The path relative to the resources.
 */
function GetResourcePath(...path: string[]): string
{
    return join(Constants.PackageDirectory, "Resources", ...path);
}

/**
 * Provides resource-files.
 */
class Files
{
    /**
     * Gets the path to the system-style.
     */
    public static SystemStyle = GetResourcePath("css", "styles.css");

    /**
     * Gets the path to the default style.
     */
    public static DefaultStyle = GetResourcePath("css", "markdown.css");

    /**
     * Gets the path to the highlight-style.
     */
    public static DefaultHighlight = GetResourcePath("css", "highlight.css");

    /**
     * Gets the path to the emoji-style.
     */
    public static EmojiStyle = GetResourcePath("css", "emoji.css");

    /**
     * Gets the path to the system-template.
     */
    public static SystemTemplate = GetResourcePath("SystemTemplate.html");

    /**
     * Gets the path to the highlight.js styles-directory.
     */
    public static HighlightJSStylesDir = join(Constants.PackageDirectory, "node_modules", "highlightjs", "styles");
}

export = Files;
