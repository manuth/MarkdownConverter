import Path = require("upath");

/**
 * Provides settings for building a project.
 */
export class Settings
{
    /**
     * A value indicating whether the project should be built in watched mode.
     */
    public Watch = false;

    /**
     * The target of the project-build.
     */
    public Target: string;

    /**
     * The path to the extension-project.
     */
    private extensionPath = "MarkdownConverter";

    /**
     * The path to load source-files from.
     */
    private sourcePath = "src";

    /**
     * The path to save built files to.
     */
    private destinationPath = "lib";

    /**
     * Initializes a new instance of the `Settings` class.
     *
     * @param target
     * The target of the project-build.
     */
    public constructor(target: string)
    {
        this.Target = target;
    }

    /**
     * A value indicating whether the debug-mode is enabled.
     */
    public get Debug()
    {
        return this.Target === "Debug";
    }

    /**
     * Creates a path relative to the root of the solution.
     *
     * @param path
     * The path to join.
     *
     * @return
     * The joined path.
     */
    public RootPath(...path: string[])
    {
        return Path.join(Path.dirname(__dirname), ...path);
    }

    /**
     * Creates a path relative to the extension-project directory.
     *
     * @param path
     * The path to join.
     *
     * @return
     * The joined path.
     */
    public ExtensionPath(...path: string[])
    {
        return this.RootPath(this.extensionPath, ...path);
    }

    /**
     * Creates a path relative to the source of the extension-project.
     *
     * @param path
     * The path to join.
     *
     * @return
     * The joined path.
     */
    public SourcePath(...path: string[])
    {
        return this.ExtensionPath(this.sourcePath, ...path);
    }

    /**
     * Creates a path relative to the directory to save the built extension to.
     *
     * @param path
     * The path to join.
     *
     * @return
     * The joined path.
     */
    public DestinationPath(...path: string[])
    {
        return this.ExtensionPath(this.destinationPath, ...path);
    }
}