import { dirname } from "path";
import pkgUp = require("pkg-up");

/**
 * Provides constants for the extension.
 */
export class Constants
{
    /**
     * The path to the root of this package.
     */
    private static packageDirectory: string = null;

    /**
     * Gets the path to the root of this package.
     */
    public static get PackageDirectory(): string
    {
        if (this.packageDirectory === null)
        {
            this.packageDirectory = dirname(pkgUp.sync({ cwd: __dirname }));
        }

        return this.packageDirectory;
    }
}
