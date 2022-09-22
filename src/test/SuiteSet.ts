/**
 * Represents a suite set.
 */
export enum SuiteSet
{
    /**
     * Represents the essential tests.
     */
    Essentials = "essentials",

    /**
     * Represents common tests.
     */
    Common = "common",

    /**
     * Represents single-file tests.
     */
    SingleFile = "single-file",

    /**
     * Represents single-folder tests.
     */
    SingleFolder = "single-folder",

    /**
     * Represents workspace tests.
     */
    Workspace = "workspace"
}
